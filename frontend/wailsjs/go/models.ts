export namespace main {
	
	export class IFileNames {
	    simple: string;
	    relative: string;
	    absolute: string;
	
	    static createFrom(source: any = {}) {
	        return new IFileNames(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.simple = source["simple"];
	        this.relative = source["relative"];
	        this.absolute = source["absolute"];
	    }
	}

}

