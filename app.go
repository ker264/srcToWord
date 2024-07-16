package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	"runtime"

	v2runtime "github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/sys/windows/registry"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) HandleRootDirectorySetOnProgrammStart() (string, error) {
	// Если передан только 1 аргумент
	if len(os.Args) == 1 {
		return "", nil
	}

	return os.Args[1], nil
}

func (app *App) sendMessageToUI(message string) {
	v2runtime.EventsEmit(app.ctx, "message", message)
}

// Проверяем находится ли программа в контестном меню windows
func (a *App) CheckRegedit() bool {
	key, err := registry.OpenKey(registry.CLASSES_ROOT, "directory\\shell\\srcToWord", registry.READ)
	defer key.Close()

	if err != nil {
		return false
	}

	return true
}

// Обновление реестра для добавления программы в контекстное меню
// addMode: bool - при true добавляем в контестное меню, при false - удаляем
func (a *App) UpdateRegedit(addMode bool) error {
	var err error

	// Управление контекстным меню папки
	folderKey, err := registry.OpenKey(registry.CLASSES_ROOT, "directory\\shell", registry.ALL_ACCESS)
	if err != nil {
		return err
	}
	defer folderKey.Close()

	// Добавление или удаление пункта меню в зависимости о режима работы
	if addMode {
		err = addToRegeditFromKey(folderKey)
	} else {
		err = deleteFromRegeditFromKey(folderKey)
	}

	if err != nil {
		return err
	}

	// Управление контекстным меню бэкграунда
	backgroundKey, err := registry.OpenKey(registry.CLASSES_ROOT, "directory\\background\\shell", registry.ALL_ACCESS)
	if err != nil {
		return err
	}
	defer backgroundKey.Close()

	// Добавление или удаление пункта меню в зависимости о режима работы
	if addMode {
		err = addToRegeditFromKey(backgroundKey)
	} else {
		err = deleteFromRegeditFromKey(backgroundKey)
	}

	return nil
}

// Удаление из контекстного меню от корневого ключа
func deleteFromRegeditFromKey(rootKey registry.Key) error {
	// Удаляется command
	subKey, err := registry.OpenKey(rootKey, registryAppName, registry.ALL_ACCESS)
	if err == nil {
		err = registry.DeleteKey(subKey, "command")
	}
	subKey.Close()

	// Удаляется запись в контекстном меню
	err = registry.DeleteKey(rootKey, registryAppName)

	return err
}

// Добавление в контекстное меню от корневого ключа
func addToRegeditFromKey(rootKey registry.Key) error {
	// Создаем пункт в меню
	subkey, _, err := registry.CreateKey(rootKey, registryAppName, registry.ALL_ACCESS)
	if err != nil {
		return err
	}
	defer subkey.Close()

	// Устанавливаем название пункта меню
	err = subkey.SetStringValue("", "Открыть в srcToWord")
	if err != nil {
		return err
	}

	// Устанавливаем путь к иконке
	err = subkey.SetStringValue("Icon", filepath.Join(filepath.Dir(os.Args[0]), "docxGeneratorStandalone.exe"))
	if err != nil {
		return err
	}

	// Создаем подключ commandKey, который содержит путь кисполняемому файлу
	commandKey, _, err := registry.CreateKey(subkey, "command", registry.ALL_ACCESS)
	if err != nil {
		return err
	}
	defer commandKey.Close()

	err = commandKey.SetStringValue("", fmt.Sprintf("\"%s\" \"%%v\"", os.Args[0]))
	if err != nil {
		return err
	}

	return nil
}

// Функции работы с каталогами на пк
type IFileNames struct {
	Simple   string `json:"simple"`
	Relative string `json:"relative"`
	Absolute string `json:"absolute"`
}

func (a *App) SelectDirectory() (string, error) {
	result, err := v2runtime.OpenDirectoryDialog(a.ctx, v2runtime.OpenDialogOptions{
		Title:                "Выбрать директорию",
		DefaultDirectory:     ".",
		ShowHiddenFiles:      true,
		CanCreateDirectories: true,
	})

	if err != nil {
		fmt.Println("Ошибка при выборе директории:", err)
		return "", err
	}

	return result, nil
}

func (a *App) SelectFilesDirectly() ([]IFileNames, error) {
	result, err := v2runtime.OpenMultipleFilesDialog(a.ctx, v2runtime.OpenDialogOptions{
		Title:                "Выбрать файлы для добавления",
		DefaultDirectory:     ".",
		ShowHiddenFiles:      true,
		CanCreateDirectories: true,
	})

	var fileNames []IFileNames

	if err != nil {
		fmt.Println("Ошибка при выборе файлов:", err)
		return fileNames, err
	}

	for _, value := range result {
		fileNames = append(fileNames, IFileNames{
			Simple:   filepath.Base(value),
			Relative: value,
			Absolute: value,
		})
	}

	return fileNames, nil
}

func (a *App) ReadDirectory(directoryPath string, isRecursive bool) ([]IFileNames, error) {

	var fileNames []IFileNames

	err := filepath.Walk(directoryPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() {
			simpleName := info.Name()
			relativePath, _ := filepath.Rel(directoryPath, path)
			absolutePath, _ := filepath.Abs(path)

			fileNames = append(fileNames, IFileNames{
				Simple:   simpleName,
				Relative: relativePath,
				Absolute: absolutePath,
			})
		} else {
			// Пропускаем поддиректории если функция не рекурсивна
			if !isRecursive && path != directoryPath {
				return filepath.SkipDir

			}
		}

		return nil
	})

	if err != nil {
		return fileNames, err
	}

	return fileNames, nil
}

func (a *App) ReadFilesForDocx(filesList []IFileNames) ([]string, error) {
	var filesData []string
	for _, value := range filesList {
		fileContent, err := os.ReadFile(value.Absolute)
		if err != nil {
			return filesData, err
		}

		filesData = append(filesData, string(fileContent))
	}
	return filesData, nil
}

func (a *App) SaveWordFile(path string, fileDataBase64 string) error {

	fileData, err := base64.StdEncoding.DecodeString(fileDataBase64)
	if err != nil {
		return err
	}

	err = os.WriteFile(path, fileData, 0644)
	if err != nil {
		return err
	}

	openExplorer(path)

	return nil
}

func (a *App) CreateDocx(filesList []IFileNames, outParts []string, encoding string) (string, error) {
	jsonData, err := json.Marshal(filesList)

	pathToDocx := filepath.Join(outParts...)

	if err != nil {
		fmt.Println("Ошибка при преобразовании в JSON:", err)
		return "", err
	}

	// Вызов docx makera
	// Путь к исполняемому файлу
	cmdPath := filepath.Join(filepath.Dir(os.Args[0]), "docxGeneratorStandalone.exe")

	// Аргументы для передачи в исполняемый файл
	args := []string{string(jsonData), pathToDocx, encoding}

	// Создание команды для выполнения
	cmd := exec.Command(cmdPath, args...)

	// Запуск команды
	err = cmd.Run()
	if err != nil {
		fmt.Println("Ошибка при запуске исполняемого файла:", err)
		return "", err
	}

	fmt.Println("Исполняемый файл успешно выполнен")
	openExplorer(pathToDocx)

	return pathToDocx, nil
}

func openExplorer(path string) {

	var cmd *exec.Cmd

	if runtime.GOOS == "windows" {
		cmd = exec.Command("explorer", path)
	} else {
		cmd = exec.Command("xdg-open", path)
	}

	cmd.Start()
}
