// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {main} from '../models';

export function CheckRegedit():Promise<boolean>;

export function HandleRootDirectorySetOnProgrammStart():Promise<string>;

export function ReadDirectory(arg1:string,arg2:boolean):Promise<Array<main.IFileNames>>;

export function ReadFilesForDocx(arg1:Array<main.IFileNames>,arg2:string):Promise<Array<string>>;

export function SaveWordFile(arg1:string,arg2:string,arg3:string):Promise<void>;

export function SelectDirectory():Promise<string>;

export function SelectFilesDirectly():Promise<Array<main.IFileNames>>;

export function UpdateRegedit(arg1:boolean):Promise<void>;
