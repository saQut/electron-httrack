'use strict';
'[node Version(2.360.700110) LastModified(26 Aralık 2020)]';
//(function(){
/**
 * @returns {hy.fn}
 */
function hy()
{
    return new hy.fn(Array.from(arguments));
};

/**
 * @param {String} e
 * @returns {Array<String>}
 */
hy._splitEventString = function(e){
    if(typeof e != "string") return [];
    if(e.indexOf(',') != -1){
        return e.split(hy._splitEventString.reg1)
    }else if(e.indexOf(':') != -1){
        return e.split(hy._splitEventString.reg3)
    }else{
        return e.split(hy._splitEventString.reg2)
    }
};
hy._splitEventString.reg1 = /\s*,\s*/g;
hy._splitEventString.reg2 = /\s+/g;
hy._splitEventString.reg3 = /\s*:\s*/g;
hy.genericValue = function(o){
	return {"boolean":true,"function":true,"number":true,"string":true,"undefined":true}[typeof o] ? true: false
}
hy.deepCopy = function(o1,o2,override,overFlip){
	if(!o1||!o2) return o1||o2;
	overFlip || (overFlip = hy.deepCopy.defaultOverflip);
	if(o2.constructor.prototype.constructor.name == "Object")
	{
		for(let name in o2)
		{
			let result = overFlip(name,o2[name],'object');
			if(o1[result.name] != undefined)
			{
				let gen1 = hy.genericValue(o1[result.name]);
				let gen2 = hy.genericValue(result.value);
				if(gen1 && !gen2)
				{
					let val = o1[result.name];
					o1[result.name] = {'#':val};
					hy.deepCopy(o1[result.name],result.value,override,overFlip)
				}else if(!gen1 && gen2)
				{
					let val = result.value;
					result.value = {'#':result.value};
					hy.deepCopy(o1[result.name],result.value,override,overFlip)
				}else{
					hy.deepCopy(o1[result.name],result.value,override,overFlip)
				}
			}
			else
			{
				if(result.value.constructor.prototype.constructor.name == "Object")
				{
					hy.deepCopy(o1[result.name]={},result.value,override,overFlip)
				}else{
					o1[result.name]=result.value;
				}
			}
		}
	}else if(o1.constructor.prototype.constructor.name == "Array" && o2.constructor.prototype.constructor.name == "Array")
	{
		for(let def=0;def<o2.length;def++)
		{
			let w;
			if((w = o1.indexOf(o2[def])) != -1)
			{
				let value = overFlip(w,o2[w],'array');
				o1.push(value);
			}
			else
			{
				let value = overFlip(w,o2[w],'array');
				o1.push(overFlip(w,hy.deepCopy({},value,override,overFlip),'array'));
			}
		}
	};
	return o2;
};
hy.deepCopy.defaultOverflip = function(name,value,type){
	return type == "object" ? {name:name,value:value} : value
};
hy.deepCopy.cssCopier = function(name,value,type){
	let t;
	let c = {};
	if(t = /^([a-z]+)[A-Z]+/.exec(name))
	{
		let vname = t[1];
		let current = c;
		name.replace(/[A-Z][a-z]*/g,function(i){
			current = current[vname] = {};
			vname = i.toLowerCase()
		});
		current[vname] = value;
		name = t[1];
		c = c[t[1]];
	}else c = value;
	return type == "object" ? {name:name,value:c} : value
};

hy.cache = {};
hy.fn = function(a){
    /**
     * @type {Array<Object>}
     */
    this.arg = a;
};


/**
 * @param {String} key
 * @param {Object} value
 * @returns {Object}
 */
hy.mem = function(key,value)
{
    if(value != null) return hy.mem.data[key] = value;
    else if(key != null) return hy.mem.data[key];
    else return hy.mem.data;
};
hy.mem.data = {};
/**
 * @returns {HTMLElement}
 */
hy.get=function(o){
    return document.querySelector(o);
};
/**
 * @returns {Array<HTMLElement>}
 */
hy.gets=function(o){
    return document.querySelectorAll(o);
};
/**
 * @param {HTMLElement} elm
 * @param {Object} obj
 */
hy.cssCtrl=function(elm,obj){
    for(let g in obj)
    {
        if(typeof obj[g] == "object")
        {
            let gc = function(objt,g,obj)
            {
                for(let ty in obj)
                {
                    if(typeof obj[ty] == "object")
                        gc(objt,g+ty.substring(0,1).toUpperCase() + ty.substring(1),obj[ty]);
					else if(ty == "#flex") hy._sharpFlex(objt,obj[ty]);
					else
                        objt[g+ty.substring(0,1).toUpperCase() + ty.substring(1)] = obj[ty];
                }
            };
            gc(elm.style,g,obj[g]);
        }else{
            if(typeof obj[g] == "function")
            {
                elm.style[g] = obj[g].call(elm)
			}else if(g == "#flex") hy._sharpFlex(elm,obj[g]);
			else{
                elm.style[g] = obj[g];
            }
        }
    }
};
/**
 * @param {String} selector
 * @param {Array<HTMLElement>|HTMLElement|hy.fn} o
 * @returns {Array<HTMLElement>|HTMLElement|hy.fn}
 */
hy.is=function(o,selector,reverse){
    let t = hy.nodes(o);
    let arr = [];
    return t.filter(hy.isElement).filter(function(element){
        return !!reverse ? !element.matches(selector) : element.matches(selector)
    })
};
/**
 * @param {Node} a
 * @returns {Boolean}
 */
hy.isNode=function(a){
    return !!a &&  !!a.nodeType && a instanceof Node
};
/**
 * @param {Node} a
 * @returns {Boolean}
 */
hy.isNodeList=function(a){
    return !!a && a instanceof NodeList
};
/**
 * @param {HTMLElement} a
 * @returns {Boolean}
 */
hy.isElement=function(a){
    return !!a &&  !!a.nodeType && a.nodeType == Node.ELEMENT_NODE && a instanceof Node
};
/**
 * @param {HTMLElement} a
 * @returns {Boolean}
 */
hy.isDocument=function(a){
    return !!a &&  !!a.nodeType && a.nodeType == Node.DOCUMENT_NODE && a instanceof Node
};
/**
 * @param {HTMLElement} a
 * @returns {Boolean}
 */
hy.isTextNode=function(a){
    return !!a && !!a.nodeType && a.nodeType == Node.TEXT_NODE && a instanceof Node
};
/**
 * @param {HTMLElement} a
 * @returns {Boolean}
 */
hy.isCDataNode=function(a){
    return !!a && !!a.nodeType && a.nodeType == Node.CDATA_SECTION_NODE && a instanceof Node
};
/**
 * @param {HTMLElement} a
 * @returns {Boolean}
 */
hy.isCommentNode=function(a){
    return !!a && !!a.nodeType && a.nodeType == Node.COMMENT_NODE && a instanceof Node
};
/**
 * @param {String} o
 * @param {Object} ctrl
 * @param {HTMLElement|hy.fn} putElement
 * @returns {hy.fn}
 */
hy.Element=function(o,ctrl,putElement){
    if(typeof o == "string"){
        let elem = hy(document.createElement(o));
        ctrl && elem.ctrl(ctrl);
        putElement && elem.put(putElement);
        return elem;
    }else{
        let t = hy.Design([o]);
        ctrl && t.put(ctrl);
        return t;
    }
};
/**
 * @param {{$:String}} obj
 * @param {HTMLElement|hy.fn} element
 * @returns {hy.fn}
 */
hy.Design = function(obj,element)
{
	let c = [];
    if(obj == null) return;
    for(let i in obj){
		let t;
        let obji = obj[i];
		if(
			hy.isElement(obji) ||
			hy.isNodeList(obji) || 
			obji instanceof HTMLCollection ||
            obji instanceof hy.fn
		) obji.put(element);
		if(typeof obji == "string") hy(element).add(t=document.createTextNode(obji));
		else if(obji) hy.Design(
			obji.xin,
			t = hy.Element(obji.$,obji,element)
		);
		t && c.push(t)
    };
	return hy(c);
};

/**
 * @param {String} r
 */
hy.redir=function(r){
	r?window.location=r:window.location.reload();
};
/**
 * @param {String} r
 * @returns {String}
 */
hy.title=function(r){
	if(r) window.document.title=r;
	else return window.document.title;
}

/**
 * @param {{url:String,type:"arraybuffer"|"blob"|"json"|"text",data:Object,get:String,contentType:"default"|"multipart"|"json"|"text"|uploadReport:Function,downloadReport:Function:success:Function,report:Function}} o
 */
hy.ajax = function(o){
	let pic_process = function(obj)
	{
		for(let item in obj)
		{
			if(obj[item]) data += "&" + item + "=" + obj[item];
			else data += "&" + item;
		};
		return data.substring(1);
	};
	let
		func = o.success,
		url = o.url + (o.get?'?'+pic_process(o.get):""),
		obj = o.data,
		isSendNow = o.sendnow == null ? true : o.sendnow;
	let request = new XMLHttpRequest(),method = "get";
	if(o.type) request.responseType = o.type;
	request.onreadystatechange = function(){
		if(request.status == 200)
		{
			if(o.on)
			{
				o.on(request.response,request.readyState,request.status);
			};
			if(o.success && request.readyState == 4)
			{
				o.success(request.response,request.readyState,request.status);
			}
		}else if(o.report){
			o.report(request.response,request.readyState,request.status);
		}
	};
	let wget = /^(post|get)?:?(.*)$/im.exec(url);
	if(wget)
	{
		url = wget[2];
		if(wget[1] || wget[1] == "") method = wget[1];
	}
	request.open(method,url,true);
	request.setRequestHeader("provider-name","hyacinth");
	request.setRequestHeader("provider-date",new Date().getTime());
	let data = "";
	let dataType = "default";
	o.contentType && (o.contentType == o.contentType.toLowerCase());
	if(o.contentType)
		if(o.contentType == "default" || o.contentType == "x-www-form-urlencoded" || o.contentType == "application/x-www-form-urlencoded"){
			dataType = "default"
		}else if(o.contentType == "multipart" || o.contentType == "multipart/form-data" || o.contentType == "form-data"){
			dataType = "multipart"
		}else if(o.contentType == "json"){
			dataType = "json"
		}else if(o.contentType == "text" || o.contentType == "line" || o.contentType == "string"){
			dataType = "unformatted"
		}else{
			dataType = [o.contentType];
		}
	if(typeof dataType == "string"){
		switch(dataType)
		{
			case "default":{
				if(typeof obj == "string")
				{
					data = obj;
				}else{
					data = pic_process(obj);
				};
				request.setRequestHeader("content-type","application/x-www-form-urlencoded");
				break;
			}
			case "multipart":{
				if(obj instanceof FormData){
					data = obj;
				}else{
					data = new FormData();
					for(let k in obj){
						data.append(k,obj[k]);
					};
				}
				break;
			}
			case "unformatted":{
				data = obj.toString();
				request.setRequestHeader("content-type", "text/plain");
				break;
			}
			default:{
				request.setRequestHeader("content-type","application/x-www-form-urlencoded");
				break;
			}
		};
	}
	else if(dataType instanceof Array){
		request.setRequestHeader("content-type",dataType[0]);
	};
	o && o.uploadReport && (
		request.upload.onprogress = o.uploadReport
	);
	o && o.downloadReport && (
		request.onprogress = o.downloadReport
	);
	if(!isSendNow)
	{
		return {
			Send:function(){
				request.send(data);
			}
		};
	}else{
		request.send(data);
		return request;
	}
};
/**
 * @returns {Array<HTMLElement>}
 */
hy.nodes = function(arg){
	let e = [];
	if(!!arg && arg.flat) arg = arg.flat(Infinity);
	if(hy.isElement(arg) || hy.isNode(arg)){
		return [arg];
	}else if(arg instanceof hy.fn){
		return hy.nodes(arg.arg);
	}else if(
		arg instanceof HTMLCollection ||
		arg instanceof HTMLAllCollection ||
		hy.isNodeList(arg)
	){
		return Array.from(arg)
	};
    Array.from(arg).flat(Infinity).forEach(function(item){
        if("string" == typeof item){
			e=e.concat(Array.from(hy.gets(item)));
        }else if(item.toString && item.toString() == '[object HTMLCollection]' && item.toString() == '[object HTMLAllCollection]'){
            e=e.concat(Array.from(item));
        }else if(item instanceof hy.fn){
			e=e.concat(item.all());
		}else if(
				item instanceof HTMLCollection ||
				item instanceof HTMLAllCollection ||
				hy.isNodeList(item)
		){
            e=e.concat(Array.from(item));
        }else if(item.toString && item.toString().startsWith('[object HTML')){
            e.push(item);
        }else if(item.ownerDocument !== undefined){
            e.push(item)
        }else if(hy.isNodeList(item)){
            e=e.concat(Array.from(item));
        }
    });
    return e;
};
/**
 * @param {HTMLElement} elm
 * @param {String} ruleText
 */
hy._basicCssCompile = function(elm,ruleText){
	let t = ruleText.split(';'),r;
	for(let j = 0;j<t.length;j++){
		if(r = hy._basicCssCompile.reg.exec(t[j])){
			elm.style[r[1].replace(/(-\w)/ig,function(r,i){
				return i[1].toUpperCase()
			})] = r[2];
		}
	};
};
hy._basicCssCompile.reg = /^\s*([^\:]+)\s*\:\s*([^\;]+)\s*$/i;
hy.fn.prototype={
	ui:function(i,func){
		let t = new (hy.fn.prototype['ui'+i])(this);
		let k = Object.create(this.__proto__);
		Object.assign(k.__proto__,t.__proto__,);
		k.arg = this.arg;
		k.$all = this.all();
		func&&func(k,this);
		return k;
	},
    // Core attributes
    /**
     * @returns {Array<HTMLElement>}
     */
    all:function(){
        return this.$all ? this.$all : this.$all = hy.nodes(this.arg);
    },
    /**
     * @returns {HTMLElement}
     */
    first:function(){
        return this.all()[0]
    },
    /**
     * @returns {HTMLElement}
     */
    last:function(){
        let list = this.all();
        return list.length != 0 ? list[list.length-1] : undefined;
    },
    /**
     * @param {Number} x
     * @param {Boolean} first
     * @returns {HTMLElement}
     */
    nd:function(x,first){
        x = x || 2;
        return hy(this.all().filter(function(item,index){
            if(index % x == 0){
                return !first;
            }else{
                return first;
            }
        }))
    },
    /**
     * @param {String|Number} son
     * @returns {hy.fn}
     */
    parent:function(son){
        if(!son){
            return hy(this.first().parentElement);
        };
        if(typeof son == "string"){
            return hy(this.first().closest(son))
        }else if(typeof son == "number"){
            let item = this.first();
            for(let u=0;u<son;u++){
                item=item.parentElement;
                if(!item) return new hy.fn()
            };
            return hy(item);
        }
    },
    /**
     * @param {String|Number} son
     * @returns {hy.fn}
     */
    next:function(son){
        if(!son){
            return hy(this.first().nextElementSibling);
        };
        if(typeof son == "string"){
            let item = this.first();
            let res = [];
            while(item){
                item=item.nextElementSibling;
                if(!item) return hy(res);
                if(hy.is(item,son).length != 0){
                    res.push(item)
                };
            };
            return new hy.fn();
        }else if(typeof son == "number"){
            let item = this.first();
            for(let u=0;u<son;u++){
                item=item.nextElementSibling;
                if(!item) return new hy.fn()
            };
            return hy(item);
        }
    },
    /**
     * @param {String|Number} son
     * @returns {hy.fn}
     */
    prev:function(son){
        if(!son){
            return hy(this.first().previousElementSibling);
        };
        if(typeof son == "string"){
            let item = this.first();
            let res = [];
            while(item){
                item=item.previousElementSibling;
                if(!item) return new hy.fn()
                if(hy.is(item,son)){
                    res.push(item)
                };
            };
            return hy(res);
        }else if(typeof son == "number"){
            let item = this.first();
            for(let u=0;u<son;u++){
                item=item.previousElementSibling;
                if(!item) return new hy.fn()
            };
            return hy(item);
        }
    },
    /**
     * @param {String|Number} son
     * @returns {hy.fn}
     */
    childs:function(son){
		let result = [];
        if(!son){
            this.each(function(){
				hy(this.children).all().forEach(function(r){
					result.push(r);
				})
			})
        };
        if(typeof son == "string"){
            this.each(function(){
				hy(this.children).is(son).forEach(function(r){
					result.push(r);
				})
			})
		};
		return hy(result)
    },
    /**
     * @param {String|Number} son
     * @returns {hy.fn}
     */
    find:function(son){
		let o = this.childs(son).all();
		this.each(function(elem){
			o = o.concat(Array.from(elem.querySelectorAll(son)).filter(function(i){
				return !o.includes(i)
			}))
		});
		return hy(o);
    },
    /**
     * @param {String|Number} son
     * @returns {hy.fn}
     */
    is:function(son){
        return hy.nodes(hy.is(this.all(),son))
    },
    /**
     * @param {(event:HTMLElement)=>{}} callback
     * @returns {hy.fn|HTML}
     */
    each:function(callback){
        this.all().forEach(function(elm){
            callback.apply(elm,[elm])
        });
        return this
    },
    /**
     * @param {(event:HTMLElement)=>{}} callback
     * @returns {hy.fn}
     */
    map:function(callback){
        return this.all().map(function(elm){
            return callback.apply(elm,[elm])
        });
    },
    /**
     * @param {(event:HTMLElement)=>{}} callback
     * @returns {hy.fn}
     */
    filter:function(callback){
        return this.all().filter(function(elm){
            return callback.apply(elm,[elm])
        });
    },
    /**
     * @param {String} name
     * @param {String} value
     * @returns {hy.fn}
     */
    css:function(name,value){
        if(typeof name == "string"){
            if(name.indexOf(':') != -1){
                return this.each(function(e){
                    hy._basicCssCompile(e,name)
                });
            }else{
                if(value == null){
                    return this.first().style.getPropertyValue(name)
                }else{
                    return this.each(function(e){
						if(name == '#flex'){
							hy._sharpFlex(e,value)
						}
                        e.style[name] = value
                    });
                };
            }
        }else{
            return this.each(function(e){
                hy.cssCtrl(e,name)
            });
        }
    },
    /**
     * @param {String} name
     * @param {String} value
     * @returns {hy.fn|String}
     */
    attr:function(name,value){
        if(typeof name == "string"){
            if(!value){
                return this.first().getAttribute(name)
            }else if(value){
                return this.each(function(e){
                    e.setAttribute(name,value)
                });
            };
        }else if(typeof name == "object"){
            for(let j in name){
                this.each(function(e){
                    e.setAttribute(name,j)
                });
            };
            return this;
        }
    },
    /**
     * @param {String} name
     * @param {String} value
     * @returns {void}
     */
    delattr:function(name){
        if(typeof name == "string"){
            this.first().attributes.removeNamedItem(name)
        }else if(typeof name == "object"){
            for(let j in name){
                this.each(function(e){
                    e.attributes.removeNamedItem(name,j)
                });
            };
        }
        return this;
    },
    /**
     * @returns {hy.fn}
     */
    truncate:function(){
        this.each(function(e){
            if(e.tagName != "INPUT") e.innerHTML="";
            else e.value = "";
        })
        return this;
    },
    /**
     * @param {Boolean} isEventClone
     * @param {Boolean} allSelecting
     * @returns {hy.fn}
     */
    clone:function(isEventClone,allSelecting){
        if(allSelecting){
            return hy(this.first().cloneNode(isEventClone))
        }else{
            return hy(this.map(function(e){
                return t.push(e.cloneNode(isEventClone))
            }))
        }
    },
    /**
     * @returns {hy.fn}
     */
    design:function(template){
		return hy(this.map(function(e){
			return hy.Design(template,e)
		}));
    },
    /**
     * @param {Number|String} numberOrSelector
     * @returns {hy.fn}
     */
    get:function(numberOrSelector){
        if(typeof numberOrSelector == "number"){
            return hy(this.all()[numberOrSelector]);
        }else if(typeof numberOrSelector == "string"){
            return this.is(numberOrSelector)
        }
    },
    /**
     * @param {Number|String} numberOrSelector
     * @returns {HTMLElement}
     */
    give:function(numberOrSelector){
        if(typeof numberOrSelector == "number"){
            return this.all()[numberOrSelector];
        }else if(typeof numberOrSelector == "string"){
            return this.is(numberOrSelector).all()
        }
    },
    /**
     * @returns {hy.fn}
     * @param {hy.fn|HTMLElement|HTMLCollection} element
     */
    put:function(element){
		this.each(function(elm){
			hy(element).first().appendChild(elm)
		})
		return this;
	},
	ctrl:function(obj)
	{
		let t = this.each(function(elm){
			if(!!obj.style) hy(this).css(obj.style);
			for (let h in obj)
			{
				if(h=="style"||h=="xin"||h=="$") continue;
				if(h=='html'){
					hy(elm).html(obj[h]);
					continue
				};
				if (obj[h] != null) 
				{
					if(h.charAt(0) != "$") elm[h] = obj[h];
					else if(typeof obj[h] != "object"){
						elm.setAttribute(h.substring(1),obj[h]);
					}else{
						let ins = function(elm,name,obj){
							for(let sname in obj){
								if(typeof obj[sname] != "object"){
									elm.setAttribute(name+"-"+sname,obj[sname]);
								}else{
									ins(elm,name+"-"+sname,obj[sname]);
								}
							}
						};
						ins(elm,h.substring(1),obj[h]);
					}
				}
			};
			if(obj.uicss)
			{
				if(obj.uicss instanceof Array || typeof obj.uicss == "string")
				{
					let cssname = hy.css.use(obj.uicss);
					hy(this).classes("+"+cssname);
				}
				else{
					let id = obj.uicss.$name ? obj.uicss.$name : hy.css.createId();
					delete obj.uicss.$name;
					hy.css.add(id,obj.uicss);
					let cssname = hy.css.use(id);
					hy(this).classes("+"+cssname);
				}
			}
		})
		return t;
	},
    /**
     * @returns {hy.fn}
     * @param {hy.fn|HTMLElement|HTMLCollection} element
     */
    add:function(element){
		let t = hy(element),all;
		if((all = t.all()).length){
			for(let a=0;a<all.length;a++) this.first().appendChild(all[a])
			return t;
		}else if(element instanceof Object && !!element.$ && typeof element.$ == "string"){
			return this.design([element]);
		}else if(element instanceof Array && element[0] && !!element[0].$ && typeof element[0].$ == "string"){
			return this.design(element);
		}else if(typeof element == "string"){
			this.each(function(){
				this.append(document.createTextNode(element))
			})
		}
	},
    /**
     * @param {String} content
     * @returns {hy.fn}
     */
    html:function(content){
		if(!content){
			return this.first().innerHTML;
		}else{
			return this.each(function(elm){ elm.innerHTML = content })
		};
    },
    /**
     * @param {String} content
     * @returns {hy.fn|String}
     */
    val:function(content){
		if(content == undefined){
			let elm = this.first();
			if(elm.tagName == "INPUT" && elm.getAttribute("type") && elm.getAttribute("type").toLowerCase() == "checkbox") return elm.checked;
			else return elm.value
		}else{
			return this.each(function(elm){
				if(elm.tagName == "INPUT" && elm.getAttribute("type") && elm.getAttribute("type").toLowerCase() == "checkbox") elm.checked = !!content;
				else elm.value = content
			})
		};
    },
    /**
     * @returns {hy.fn}
     * @param {String|Number} element
     * @param {Number} nd2
     */
    remove:function(query,nd2){
        if(typeof query == "number"){
            let list = this.all();
            list.slice(!nd2?0:query,nd2).forEach(function(elem){
                elem.remove()
            });
        }else if(typeof query == "string"){
            this.is(query).each(function(elem){
                elem.remove()
            });
        }else{
            this.each(function(elem){
                elem.remove()
            });
        };
        delete this.$all;
        return this;
    },
    /**
     * @param {String} eventName
     * @param {String} query
     * @param {Function} callback
     * @param {EventListenerOptions} options
     * @returns {hy.fn}
     */
    on:function(eventName,query,callback,options){
        let events = hy._splitEventString(eventName);
        if(typeof query == "function"){
            options = callback;
            callback = query;
            return this.each(function(elem){
                events.forEach(function(event){
                    elem.addEventListener(event,callback,options)
                })
            })
        }else{
            return this.each(function(elem){
                events.forEach(function(event){
                    elem.addEventListener(event,function(evnt){
                        let tevent = (evnt || window.event);
                        hy(tevent.path).is(query).each(function(elem){
                            callback.apply(elem,[tevent])
                        })
                    });
                })
            })
        }
    },
    /**
     * @param {String|Event} eventName
     * @param {EventInit} options
     * @returns {hy.fn}
     */
    trigger:function(eventName,options){
        if(eventName instanceof Event){
            return this.each(function(elem){
                elem.dispatchEvent(eventName)
            })
        }else{
            let events = hy._splitEventString(eventName);
            return this.each(function(elem){
                events.forEach(function(event){
                    elem.dispatchEvent(new Event(event,options))
                })
            })
        }
    },
    /**
     * @returns {Event[]}
     */
    events:function(){
        return window.getEventListeners(this.first());
    },
    /**
     * @param {String} eventName
     * @param {Function} callback
     * @returns {Event[]}
     */
    off:function(eventName,callback){
        return this.each(function(elem){
            elem.removeEventListener(name,callback)
        })
    },
    /** @returns {hy.fn} */
    mousedown:function(callback,options){return !!callback?this.on("mousedown",callback):this.trigger("mousedown")},
    /** @returns {hy.fn} */
    mouseup:function(callback,options){return !!callback?this.on("mouseup",callback):this.trigger("mouseup")},
    /** @returns {hy.fn} */
    mousemove:function(callback,options){return !!callback?this.on("mousemove",callback):this.trigger("mousemove")},
    /** @returns {hy.fn} */
    mouseenter:function(callback,options){return !!callback?this.on("mouseenter",callback):this.trigger("mouseenter")},
    /** @returns {hy.fn} */
    mouseleave:function(callback,options){return !!callback?this.on("mouseleave",callback):this.trigger("mouseleave")},
    /** @returns {hy.fn} */
    mouseover:function(callback,options){return !!callback?this.on("mouseover",callback):this.trigger("mouseover")},
    /** @returns {hy.fn} */
    mouseout:function(callback,options){return !!callback?this.on("mouseout",callback):this.trigger("mouseout")},
    /** @returns {hy.fn} */
    click:function(callback,options){return !!callback?this.on("click",callback):this.trigger("click")},
    /** @returns {hy.fn} */
    dblclick:function(callback,options){return !!callback?this.on("dblclick",callback):this.trigger("dblclick")},
    /** @returns {hy.fn} */
    focus:function(callback,options){return !!callback?this.on("focus",callback):this.trigger("focus")},
    /** @returns {hy.fn} */
    blur:function(callback,options){return !!callback?this.on("blur",callback):this.trigger("blur")},
    /** @returns {hy.fn} */
    focusout:function(callback,options){return !!callback?this.on("blur",callback):this.trigger("blur")},
    /** @returns {hy.fn} */
    change:function(callback,options){return !!callback?this.on("change",callback):this.trigger("change")},
    /** @returns {hy.fn} */
    contextmenu:function(callback,options){return !!callback?this.on("contextmenu",callback):this.trigger("contextmenu")},
    /** @returns {hy.fn} */
    cut:function(callback,options){return !!callback?this.on("cut",callback):this.trigger("cut")},
    /** @returns {hy.fn} */
    copy:function(callback,options){return !!callback?this.on("copy",callback):this.trigger("copy")},
    /** @returns {hy.fn} */
    paste:function(callback,options){return !!callback?this.on("paste",callback):this.trigger("paste")},
    /** @returns {hy.fn} */
    play:function(callback,options){return !!callback?this.on("play",callback):this.trigger("play")},
    /** @returns {hy.fn} */
    pause:function(callback,options){return !!callback?this.on("pause",callback):this.trigger("pause")},
    /** @returns {hy.fn} */
    load:function(callback,options){return !!callback?this.on("load",callback):this.trigger("load")},
    /** @returns {hy.fn} */
    error:function(callback,options){return !!callback?this.on("error",callback):this.trigger("error")},
    /** @returns {hy.fn} */
    input:function(callback,options){return !!callback?this.on("input",callback):this.trigger("input")},
    /** @returns {hy.fn} */
    resize:function(callback,options){return !!callback?this.on("resize",callback):this.trigger("resize")},
    /** @returns {hy.fn} */
    wheel:function(callback,options){return !!callback?this.on("wheel",callback):this.trigger("wheel")},
    /** @returns {hy.fn} */
    submit:function(callback,options){return !!callback?this.on("submit",callback):this.trigger("submit")},
    /** @returns {hy.fn} */
    select:function(callback,options){return !!callback?this.on("select",callback):this.trigger("select")},
    /** @returns {hy.fn} */
    keydown:function(callback,options){return !!callback?this.on("keydown",callback):this.trigger("keydown")},
    /** @returns {hy.fn} */
    keypress:function(callback,options){return !!callback?this.on("keypress",callback):this.trigger("keypress")},
    /** @returns {hy.fn} */
    keyup:function(callback,options){return !!callback?this.on("keyup",callback):this.trigger("keyup")},
    // DOM Attributes ############################################################
    /**
     * @param {"dom"|"rect"|"scroll"} type
     * @returns {{top:Number,left:Number,right:Number,bottom:Number,width:Number,height:Number}}
     */
    offset:function(type){
        let f = this.first();
        if(type == "dom"){
            return {
                width:f.clientWidth,
                height:f.clientHeight,
                left:f.clientLeft,
                top:f.clientTop
            }
        }else if(!type || type == "rect"){
            let rect = f.getClientRects()[0];
            return {
                width:rect.width,
                height:rect.height,
                left:rect.left,
                top:rect.top,
                right:rect.right,
                bottom:rect.bottom
            };
        }else if(type == "scroll"){
            return {
                width:f.scrollLeft,
                height:f.scrollHeight,
                left:f.scrollLeft,
                top:f.scrollTop
            }
        }
    },
    /**
     * @param {String|Number} clss
     * @returns {hy.fn}
     */
    classes:function(clss){
        let R = [],T=[],A=[];
        let F = hy._splitEventString(clss);
        F.forEach(function(item){
            let s = item.charAt(0);
            if(s=='-'){
                R.push(item.substring(1))
            }else if(s=='+'){
                A.push(item.substring(1))
            }else{
                T.push(item)
            }
        })
        this.each(function(elem){
            let cls = elem.classList;
            A.forEach(function(clss){
                cls.add(clss)
            })
            T.forEach(function(clss){
                if(cls.contains(clss)) cls.remove(clss);
                else cls.add(clss);
            })
            R.forEach(function(clss){
                cls.remove(clss);
            })
        });
        return this;
    },
    /**
     * @param {String|Number} clss
     * @returns {Boolean}
     */
    hasClass:function(clss){
        return this.first().classList.contains(clss)
    },
    /**
     * @param {String|Number} size
     * @returns {String|Number|hy.fn}
     */
    width:function(size){
        return !!size ? this.css("width",typeof size == "number" ? size+"px":size) : this.offset("dom").width
    },
    /**
     * @param {String|Number} size
     * @returns {String|Number|hy.fn}
     */
    height:function(size){
        return !!size ? this.css("height",typeof size == "number" ? size+"px":size) : this.offset("dom").height
    },
    /**
     * @param {String|Number} size
     * @returns {String|Number|hy.fn}
     */
    top:function(size){
        return !!size ? this.css("top",size) : this.offset("dom").top
    },
    /**
     * @param {String|Number} size
     * @returns {String|Number|hy.fn}
     */
    left:function(size){
        return !!size ? this.css("left",size) : this.offset("dom").left
    },
    /**
     * @param {String|Number} size
     * @returns {String|Number|hy.fn}
     */
    right:function(size){
        return !!size ? this.css("right",size) : this.offset("dom").right
    },
    /**
     * @param {String|Number} size
     * @returns {String|Number|hy.fn}
     */
    bottom:function(size){
        return !!size ? this.css("bottom",size) : this.offset("dom").bottom
    },
    /**
     * @returns {hy.fn}
     */
    hide:function(){
        return this.css("display","none")
    },
    /**
     * @returns {hy.fn}
     */
    show:function(){
        return this.css("display","")
    },
    /**
     * @param {String} color
     * @returns {hy.fn}
     */
    color:function(color){
        return this.css("color",color)
    },
    /**
     * @param {String} color
     * @returns {hy.fn}
     */
    bgcolor:function(color){
        return this.css("background-color",color)
    },
    /**
     * @param {String} background
     * @returns {hy.fn}
     */
    bg:function(background){
        if(typeof background == "string"){
            return this.css("background",background)
        }else{
            let obj = {};
            for(let name in background){
                obj['background-'+name] = background[name];
            };
            return this.css(obj);
        }
    },
    /**
     * @param {String} direction
     * @returns {hy.fn}
     */
    float:function(direction){
        return this.css("float",direction);
    },
    /**
     * @param {String} layout
     * @returns {hy.fn|String}
     */
    flex:function(layout,size){
		let r = false;
        if(!layout){
            return this.css("display","flex");
        }else{
			if(layout.indexOf('flex') != -1) this.css("display","flex");
			else if(layout.indexOf('inline-flex') != -1) this.css("display","inline-flex");
			if(layout.indexOf('row') != -1) this.css("flex-direction","row");
			else if(layout.indexOf('row-reverse') != -1) this.css("flex-direction","row-reverse");
			else if(layout.indexOf('column') != -1) this.css("flex-direction","column");
			else if(layout.indexOf('column-reverse') != -1) this.css("flex-direction","column-reverse");
			if(layout.indexOf('fill') != -1) this.css("flex","1 1 "+(typeof size=="string"?size:"0px"));
			if(layout.indexOf('min') != -1) this.css("flex","0 0 "+(typeof size=="string"?size:"0px"));
			if(layout.indexOf('wrap-reverse') != -1) this.css("flex-wrap","wrap-reverse");
			else if(layout.indexOf('nowrap') != -1) this.css("flex-wrap","nowrap");
			else if(layout.indexOf('wrap') != -1) this.css("flex-wrap","wrap");
			return this;
		};
    }
}

hy.timing = function(func,mls){
	let r = [];
	r.push([func,mls]);
	function run()
	{
		let time = 0;
		for(let k in r)
		{
			setTimeout(r[k][0],time += (r[k][1]||1));
		};
	};
	let a = function(func,mls){
		if(typeof func == "function")
		{
			r.push([func,mls]);
			return a;
		}else return run();
	};
	return a;
};
hy.atiming = function(func,mls){
	let r = [];
	r.push([func,mls]);
	function run()
	{
		for(let k in r)
			setTimeout(r[k][0],r[k][1]||1);
	};
	let a = function(func,mls){
		if(typeof func == "function")
		{
			r.push([func,mls]);
			return a;
		}else return run();
	};
	return a;
};
(!hy.mem("nowindow")) && window.addEventListener("load",function(){
	if(hy.load.inited) return;
	hy.load.trigger();
	hy.load.inited = true;
});
hy.load = function(a){
	if(hy.load.inited){
		a();
	}else hy.load.events.push(a);
};
hy.load.inited = false;
hy.load.events = [];
hy.load.trigger = function(){
	for(let j = 0;j<hy.load.events.length;j++) hy.load.events[j]();
};
(!hy.mem("nowindow")) && window.addEventListener("DOMContentLoaded",function(){
	if(hy.ready.inited) return;
	hy.ready.trigger();
	hy.ready.inited = true;
});
hy.ready = function(a){
	if(hy.ready.inited){
		a();
	}else hy.ready.events.push(a);
};
hy.ready.inited = false;
hy.ready.events = [];
hy.ready.trigger = function(){
	for(let j = 0;j<hy.ready.events.length;j++) hy.ready.events[j]();
};

function ixir(_date,lang)
{
	this.lang = lang ? lang : "en";
	this.value = 0;
	this.date = ixir.Init(_date);
	/**
	 * @public
	 */
	this.add = function(arg,newvalue){
		let arg1 = ixir.dateToValue(ixir.Init(arg));
		let arg2 = ixir.dateToValue(this.date);
		let value = arg2 + arg1;
		if(newvalue) return new ixir(value);
		else return this.date = ixir.valueToDate(value);
	};
	this.diff = function(arg,newvalue){
		let arg1 = ixir.dateToValue(ixir.Init(arg));
		let arg2 = ixir.dateToValue(this.date);
		let value = arg2 - arg1;
		if(newvalue) return new ixir(value);
		else return this.date = ixir.valueToDate(value);
	};
	this.different = function(arg,newvalue){
		let arg1 = ixir.dateToValue(ixir.Init(arg));
		let arg2 = ixir.dateToValue(this.date);
		let value = arg1 - arg2;
		if(newvalue) return new ixir(value);
		else return this.date = ixir.valueToDate(value);
	};
	this.isAfter = function(arg){
		let arg1 = ixir.dateToValue(ixir.Init(arg));
		let arg2 = ixir.dateToValue(this.date);
		return arg2 > arg1
	};
	this.isBefore = function(arg){
		let arg1 = ixir.dateToValue(ixir.Init(arg));
		let arg2 = ixir.dateToValue(this.date);
		return arg2 < arg1
	};
};
ixir.lang = 'en';
ixir.SortDates = function(arg){
	let args = [];
	if(arg instanceof Array)
	{
		args = arg
	}else{
		args = _argumentsCounter.apply(this,arguments);
	};
	for(let h = 0;h<args.length;h++){
		args[h] = ixir.dateToValue(ixir.Init(args[h]));
	};
	args = args.sort();
	for(let h = 0;h<args.length;h++){
		args[h] = ixir.Init(args[h]);
	};
	return args;
};
let _argumentsCounter = function(){
	if(Array.from){
		return Array.from(arguments);
	}else for(let i=0;i<arguments.length;i++){
		args.push(arguments[i]);
	};
	return args;
}
ixir.now = function()
{
	return ixir.Init(new Date());
};

ixir.int = parseInt;
ixir.Init = function(o,debug){
	let that = new ixir.date();
	if(!o){
		return that;
	};
	if(o instanceof Array && o.length >= 3){
		that.year = o[0];
		that.month = o[1];
		that.day = o[2];
		if(o[3]) that.hour = o[3];
		if(o[4]) that.minute = o[4];
		if(o[5]) that.second = o[5];
	}else if(o instanceof ixir.date){
		that.year = o.year;
		that.month = o.month;
		that.day = o.day;
		that.hour = o.hour;
		that.minute = o.minute;
		that.second = o.second;
	}else if(o instanceof ixir){
		that = o.date;
	}else if(typeof o == "number" || o instanceof Date){
		that = ixir.valueToDate(ixir.dateToValue(o));
	}else if(typeof o == "string"){
		if(ixir.keyStoken.isKeystoken(o)){
			that = ixir.keyStoken(o.substring(1))
		}else{
			let yd = ixir.string.format(o);
			if(yd){
				that = yd;
			}else{
				try{
					that = ixir.dateToValue(new Date(o));
				}catch(i){
					throw new Error("Could not convert for Argument use; Invalid data");
				}
			}
		}
	}else if(
		typeof o == "object" && (
			o.second !== undefined ||
			o.minute !== undefined ||
			o.hour !== undefined ||
			o.day !== undefined ||
			o.month !== undefined ||
			o.year !== undefined
		)
	){
		if(o.year) that.year = o.year;
		if(o.month) that.month = o.month;
		if(o.day) that.day = o.day;
		if(o.hour) that.hour = o.hour;
		if(o.minute) that.minute = o.minute;
		if(o.second) that.second = o.second;
	}else{
		if(debug){
			debug();
		}else throw new Error("Could not convert Date to ixir value; Invalid data type");
	};
	that.calculate();
	return that;
};
ixir.keyStoken = function(text){
	let dateObject = new ixir.date();
	text = text.split(/\s*,\s*/);
	for(let u = 0;u < text.length;u++){
		let val = function(name,value){
			if(value.charAt(0) == "-" || value.charAt(0) == "+")
			{
				dateObject[name] += parseFloat(value);
			}else{
				dateObject[name] = parseFloat(value);
			}
		}
		let key = text[u].match(/([+-]?\s*[\d\.]+)\s*(\w+)|([+-])(.*)/),value,isAdd;
		if(!key[1] && key[3])
		{	
			value = key[4], isAdd = key[3] == "+";
			key = "date";
		}else{
			value = key[1];
			key = key[2];
		}
		switch(key.toLowerCase())
		{
			case "y":
			case "year":
			case "yyyy":
				val("year",value);
				break;
			case "month":
			case "mon":
			case "m":
				val("month",value);
				break;
			case "day":
				val("day",value);
				break;
			case "date":
			case "d":
				if(isAdd) dateObject.add(value);
				else dateObject.diff(value);
				break;
			case "hour":
			case "hr":
			case "h":
				val("hour",value);
				break;
			case "min":
			case "minute":
				val("minute",value);
				break;
			case "s":
			case "sec":
			case "second":
				val("second",value);
				break;
		}
	};
	return dateObject;
};
ixir.keyStoken.isKeystoken = function(text){
	return text.charAt(0) == '>';
};
ixir.string = {};
ixir.string.formats = {
	DateTime : [/*13:22:54 20/08/2018 | 20/08/2018 13:22:54 */
		/^(\d+:\d+)(:\d+)?\s*(\d+[\.\\\/-]\d+[\.\\\/-]\d+)|(\d+[\.\\\/-]\d+[\.\\\/-]\d+)\s+(\d+:\d+)(:\d+)?$/ig,
		function(s){
			let formats = ixir.string.formats;
			let date = new ixir.date();
			let t,e;
			if(s[4])
			{
				t = formats.Time[0].exec(s[5]+(s[6]||""));
				e = formats.Date[0].exec(s[4]);
			}else{
				t = formats.Time[0].exec(s[1]+(s[2]||""));
				e = formats.Date[0].exec(s[3]);
			};
			if(t)
			{
				formats.Time[1](t,date);
			};
			if(e)
			{
				formats.Date[1](e,date);
			};
			return date;
		},function(date){
			let time = "";
			time += [
				date.day < 10 ? "0" + date.day : date.day,
				date.month < 10 ? "0" + date.month : date.month,
				date.year < 10 ? "000" : (
					date.year < 100 ? "00" + date.year : (
						date.year < 1000 ? "0" : date.year
					)
				)
			].join(".");
			if(!(date.second == 0 && date.minute == 0 && date.hour== 0)){
				time += " "+[
					date.hour < 10 ? "0" + date.hour : date.hour,
					date.minute < 10 ? "0" + date.minute : date.minute,
					date.second < 10 ? "0" + date.second : date.second
				].join(":");
			};
			return time;
		}
	],
	IXIRFormat : [/*12:27:00 @ 25.02.2018 */
		/^(\d+:\d+)(:\d+)?\s*@\s*(\d+[\.\\\/-]\d+[\.\\\/-]\d+)$/ig,
		function(s){
			let formats = ixir.string.formats;
			let date = new ixir.date();
			let t = formats.Time[0].exec(s[1]+(s[2]||""));
			let e = formats.Date[0].exec(s[3]);
			if(t)
			{
				formats.Time[1](t,date);
			};
			if(e)
			{
				formats.Date[1](e,date);
			};
			return date;
		},function(date){
			let k = "";
			k += ixir.string.formats.Time[2](date);
			if(date.month == 0 && date.year == 0 && date.day == 0){
				return k;
			}else{
				return k + " @ " + (date.day < 10 ? "0"+date.day : date.day) + "." + (date.month < 10 ? "0"+date.month : date.month) + "." + date.year
			}
		}
	],
	Time : [/*12:27:12 | 12:27*/
		/^(\d{1,2})[:\.](\d{2})([:\.]\d{2})?$/i,
		function(s,x){
			let date = x || new ixir.date();
			date.hour = ixir.int(s[1]);
			date.minute = ixir.int(s[2]);
			if(s[3]) date.second = ixir.int(s[3].substring(1));
			return date;
		},
		function(date){
			let t = "";
			t += date.hour < 10 ? "0"+date.hour:date.hour;
			t += ':' + (date.minute < 10 ? "0"+date.minute:date.minute);
			t += date.second == 0 ? '' : date.second < 10 ? ":0"+date.second : ':'+date.second;
			return t;
		}
	],
	Date : [/*00.00.0000 00/00/0000 0.0.00*/
		/^(\d{1,2})[\.\\\/-](\d{1,2})[\.\\\/-](\d{2,4})$/i,
		function(s,x){
			let date = x || new ixir.date();
			date.day = ixir.int(s[1]);
			date.month = ixir.int(s[2]);
			if(s[3].length != 4)
			{
				let _c = (new Date().getFullYear()).toString();
				if(s[3].length == 3)
				{
					date.year = _c.charAt(0) + s[3]
				}else if(s[3].length == 2){
					date.year = _c.charAt(0) + _c.charAt(1) + s[3]
				};
				date.year = ixir.int(date.year);
			}else date.year = ixir.int(s[3]);
			return date;
		},function(date){
			return [(date.day < 10 ? "0"+date.day : date.day),(date.month < 10 ? "0"+date.month : date.month),date.year].join('.');
		}
	],
	ISODateTime : [/*0000-00-00 00:00:00.000000*/
		/^(\d{4})-(\d{2})-(\d{2})\s*(\d{2})\:(\d{2})\:(\d{2})(\.\d+)?$/i,
		function(s,x){
			let date = x || new ixir.date();
			date.day = ixir.int(s[3]);
			date.month = ixir.int(s[2]);
			date.year = ixir.int(s[1]);
			date.hour = ixir.int(s[4]);
			date.minute = ixir.int(s[5]);
			date.second = ixir.int(s[6]);
			return date;
		},function(date){
			return  (date.year < 10 ? "0"+date.year : date.year)+'-'+
			(date.month < 10 ? "0"+date.month : date.month)+'-'+
			(date.day < 10 ? "0"+date.day : date.day)+' '+
			(date.hour < 10 ? "0"+date.hour : date.hour)+':'+
			(date.minute < 10 ? "0"+date.minute : date.minute)+':'+
			(date.second < 10 ? "0"+date.second : date.second);
		}
	],
	ISODate: [/*0000-00-00*/
		/^(\d{4})-(\d{2})-(\d{2})$/i,
		function(s,x){
			let date = x || new ixir.date();
			date.day = ixir.int(s[3]);
			date.month = ixir.int(s[2]);
			date.year = ixir.int(s[1]);
			return date;
		},function(date){
			return  (date.year < 10 ? "0"+date.year : date.year)+'-'+
			(date.month < 10 ? "0"+date.month : date.month)+'-'+
			(date.day < 10 ? "0"+date.day : date.day);
		}
	],
	ISOTime : [/*00:00:00.000000*/
		/^(\d{2})\:(\d{2})\:(\d{2})(\.\d+)?$/i,
		function(s,x){
			let date = x || new ixir.date();
			date.hour = ixir.int(s[1]);
			date.minute = ixir.int(s[2]);
			date.second = ixir.int(s[3]);
			return date;
		},function(date){
			return (date.hour < 10 ? "0"+date.hour : date.hour)+':'+
			(date.minute < 10 ? "0"+date.minute : date.minute)+':'+
			(date.second < 10 ? "0"+date.second : date.second);
		}
	]
};


ixir.string.format = function(arg,word){
	if(typeof arg == "string"){
		let k;
		for(let l in ixir.string.formats)
		{
			if(k = new RegExp(ixir.string.formats[l][0]).exec(arg)){
				return ixir.string.formats[l][1](k);
			}
		};
		return false;
	}else if(arg instanceof ixir.date){
		return (ixir.string.formats[word][2] && ixir.string.formats[word][2](arg));
	}else if(arg instanceof ixir){
		return (ixir.string.formats[word][2] && ixir.string.formats[word][2](arg.date));
	}
};
ixir.valueToDate = function(nval,calcLeapYear){
	let srs = ixir.source;
	let val = Math.abs(nval);
	let _date = new ixir.date();
	_date.negative = nval < 0;
	if(val instanceof ixir.date) _date.second = val.second;
	else if(typeof val == "number") _date.second = val;

	if(_date.second > srs.minuteseconds-1)
	{
		_date.minute += parseInt(_date.second / srs.minuteseconds);
		_date.second = _date.second % srs.minuteseconds
	};
	if(_date.minute > srs.hourminutes-1)
	{
		_date.hour += parseInt(_date.minute / srs.hourminutes);
		_date.minute = _date.minute % srs.hourminutes
	};
	if(_date.hour > srs.dayhours-1)
	{
		_date.day += parseInt(_date.hour / srs.dayhours);
		_date.hour = _date.hour % srs.dayhours
	};
	if(_date.day > ixir.rangeMonthDay(_date.day)){
		let t = ixir.dayMonth(_date.day);
		_date.month = parseInt(t[0]);
		_date.day = t[1]
	}
	if(_date.month > srs.yearmonths-1){
		_date.year += parseInt(_date.month / srs.yearmonths);
		_date.month = _date.month % srs.yearmonths
	}else if(_date.month < 0){
		_date.year -= parseInt(_date.month / srs.yearmonths);
		_date.month = _date.month % srs.yearmonths
	};
	if(!calcLeapYear) return _date;
	let appendDay = 0;
	appendDay += parseInt(_date.year / 4);
	_date.day += appendDay;
	if(_date.day > 30){
		let t = ixir.dayMonth(_date.day);
		_date.month = parseInt(t[0]);
		_date.day = t[1]
	};
	if(_date.month > srs.yearmonths-1){
		_date.year += parseInt(_date.month / srs.yearmonths);
		_date.month = _date.month % srs.yearmonths
	}else if(_date.month < 0){
		_date.year -= parseInt(_date.month / srs.yearmonths);
		_date.month = _date.month % srs.yearmonths
	};
	return _date;
};
ixir.source = {
	strings:{
		monthname : {
			tr:["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],
			en:["January","February","March","April","May","June","July","August","September","October","November","December"]
		},
		dayname : {
			tr:["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"],
			en:["Sunday","Monday","Tuesday","Wednesday","Thirsday","Friday","Saturday"]
		}
	},
	Month : [
		31,28,31,30,31,30,31,31,30,31,30,31
	],
	minuteseconds:60,
	hourminutes:60,
	dayhours:24,
	weekdays:7,
	yearmonths:12,
	lang:"en"
};

ixir.date = function(o){
	this.negative = false;
	//this.milad = false;
	this.year = 0;
	this.month = 0;
	this.day = 0;
	this.hour = 0;
	this.minute = 0;
	this.second = 0;
	//calculated
	this.week = 0;
	this.weekday = 0;
	this.monthname = '';
	this.dayname = '';
};
ixir.date.prototype.value = function(){
	return ixir.dateToValue(this);
};
ixir.date.prototype.getDay = function(){
	return this.date().getDay();
};
ixir.date.prototype.date = function(){
	if(this.negative)
	{
		let u = new Date(this.year,this.month-1,this.day,this.hour,this.minute,this.second).getTime();
		return new Date(-u);
	}else{
		return new Date(this.year,this.month-1,this.day,this.hour,this.minute,this.second);
	}
};
ixir.date.prototype.getWeek = function()
{
	let date = this.date();
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	let week1 = new Date(date.getFullYear(), 0, 4);
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}
ixir.date.prototype.calculate = function(lang){
	let redate = ixir.valueToDate(ixir.dateToValue(this)),
		week = redate.getWeek(),
		day = redate.getDay(),
		dayname = ixir.source.strings.dayname[ixir.lang],
		Month = ixir.source.strings.monthname[ixir.lang];
	this.year = redate.year;
	this.month = redate.month;
	this.day = redate.day;
	this.hour = redate.hour;
	this.minute = redate.minute;
	this.second = redate.second;
	this.weekday = day;
	this.dayname = dayname[day];
	this.week = week;
	this.monthname = Month[this.month-1];
	this.negative = redate.negative;
}
ixir.prototype.update = function(){
	return this.date.calculate(this.lang);
}
ixir.prototype.getDay = function(){
	return this.date.getDay();
};
ixir.formats={};
ixir.setProperty = function(key){
	ixir.date.prototype["to"+key] = 
	ixir.date.prototype["to"+key.toLowerCase()] = function(){
		return ixir.string.formats[key][2](this)
	};
	ixir.prototype["to"+key] = 
	ixir.prototype["to"+key.toLowerCase()] = function(){
		return ixir.string.formats[key][2](this.date)
	};
	ixir.formats[key.toLowerCase()]=1;
};
ixir.prototype.format = function(key){
	return ixir.formats[key.toLowerCase()] && this["to"+key]();
};
for(let key in ixir.string.formats) ixir.setProperty(key);
ixir.dateToValue = function(_date,leapYear){
	let value = 0;
	if(_date instanceof ixir){
		_date=_date.date;
		value += _date.second;
		value += ixir.minSec(_date.minute);
		value += ixir.hourSec(_date.hour);
		value += ixir.daySec(_date.day);
		value += ixir.monthSec(_date.month)
		value += ixir.yearSec(_date.year,leapYear);
		value = _date.negative ? -value : value
	}else if(_date instanceof ixir.date){
		value += _date.second;
		value += ixir.minSec(_date.minute);
		value += ixir.hourSec(_date.hour);
		value += ixir.daySec(_date.day);
		value += ixir.monthSec(_date.month)
		value += ixir.yearSec(_date.year,leapYear);
		value = _date.negative ? -value : value
	}else if(_date instanceof Date){
		value += _date.getSeconds();
		value += ixir.minSec(_date.getMinutes());
		value += ixir.hourSec(_date.getHours());
		value += ixir.daySec(_date.getDate());
		value += ixir.monthSec(_date.getMonth()+1)
		value += ixir.yearSec(_date.getFullYear());
	}else if(typeof _date == "number"){
		value = _date;
	}else if(typeof _date == "string"){
		value = _date;
	}else{
		throw new Error("Could not convert Date to ixir value; Invalid data type");
	};
	return value;
};

ixir.secMin = function(val){
	return val / ixir.source.minuteseconds
};
ixir.secHour = function(val){
	return val / (ixir.source.minuteseconds*ixir.source.hourminutes)
};
ixir.secDay = function(val){
	return val / (ixir.source.minuteseconds*ixir.source.hourminutes*ixir.source.dayhours)
};
ixir.secMonth = function(val){
	return ixir.monthDay(val) / (ixir.source.minuteseconds*ixir.source.hourminutes*ixir.source.dayhours)
};
ixir.secYear = function(val,leapYear){
	return val / (365*ixir.source.minuteseconds*ixir.source.hourminutes*ixir.source.dayhours  * (leapYear?1.25:1))
};
ixir.minSec = function(val){
	return val * ixir.source.minuteseconds
};
ixir.minHour = function(val){
	return val / (ixir.source.minuteseconds*ixir.source.hourminutes)
};
ixir.minDay = function(val){
	return val / (ixir.source.hourminutes*ixir.source.dayhours)
};
ixir.minMonth = function(val){
	return ixir.monthDay(val) / (ixir.source.minuteseconds*ixir.source.hourminutes*ixir.source.dayhours)
};
ixir.minYear = function(val,leapYear){
	return val / (365*ixir.source.minuteseconds*ixir.source.hourminutes*ixir.source.dayhours * (leapYear?1.25:1))
};

ixir.hourSec = function(val){
	return val * ixir.source.minuteseconds*ixir.source.hourminutes
};
ixir.hourMin = function(val){
	return val / (ixir.source.hourminutes)
};
ixir.hourDay = function(val){
	return val / ixir.source.dayhours
};
ixir.hourMonth = function(val){
	return ixir.monthDay(val) / ixir.source.dayhours
};
ixir.hourYear = function(val,leapYear){
	return val / (365*ixir.source.dayhours * (leapYear?1.25:1))
};


ixir.daySec = function(val){
	return val * ixir.source.minuteseconds*ixir.source.hourminutes*ixir.source.dayhours
};
ixir.dayMin = function(val){
	return val / (ixir.source.hourminutes*ixir.source.dayhours)
};
ixir.dayHour = function(val){
	return val * ixir.source.dayhours
};
ixir.dayYear = function(val,leapYear){
	return val / (365*ixir.source.dayhours * (leapYear?1.25:1))
};

ixir.monthInDay = function(month){
	return ixir.source.Month[month % ixir.source.yearmonths]
};
ixir.monthDay = function(dayStart,dayStop)
{
	let ndayStart = Math.abs(dayStart),nsdayStop = dayStop ? Math.abs(dayStop) : null;
	let day = 0;
	if(nsdayStop==null){
		nsdayStop=ndayStart;
		ndayStart=0
	}else if(ndayStart==null && nsdayStop!=null){
		ndayStart = nsdayStop;
		nsdayStop++
	}
	for(let f=ndayStart;f<nsdayStop;f++) day += ixir.monthInDay(f);
	return dayStart < 0 ? -day : day;
};
ixir.monthHour = function(val){
	return ixir.monthDay(val) * ixir.source.dayhours
};
ixir.monthMin = function(val){
	return ixir.monthDay(val) * ixir.source.dayhours * ixir.source.hourminutes
};
ixir.monthSec = function(val){
	return ixir.monthDay(val) * ixir.source.dayhours * ixir.source.hourminutes * ixir.source.minuteseconds
};
ixir.monthYear = function(val){
	return val / ixir.source.yearmonths
};


ixir.yearMonth = function(val){
	return val * ixir.source.yearmonths
};
ixir.yearDay = function(val,leapYear){
	return parseInt(val * 365 * (leapYear?1.25:1))
};
ixir.yearHour = function(val,leapYear){
	return parseInt(val * 365 * ixir.source.dayhours * (leapYear?1.25:1))
};
ixir.yearMin = function(val,leapYear){
	return parseInt(val * 365 * ixir.source.dayhours * ixir.source.hourminutes * (leapYear?1.25:1))
};
ixir.yearSec = function(val,leapYear){
	return parseInt(val * 365 * ixir.source.dayhours * ixir.source.hourminutes * ixir.source.minuteseconds * (leapYear?1.25:1))
};


ixir.dayMonth = function(day){
	let month = 0;
	while(true)
		if(day >= ixir.monthInDay(month))
		{
			day -= ixir.monthInDay(month);
			month++
		}else break;
	if(day != 0) month += day / ixir.monthInDay(month);
	return [month,day]
};
ixir.rangeMonthDay = function(day)
{
	let month = 0;
	while(true) if(day > ixir.monthInDay(month)){
		day -= ixir.monthInDay(month); 
		month++
	}else break;
	return ixir.source.Month[month % ixir.source.yearmonths]
};
/* Version 2 */

ixir.isAfter = function(a,b){
	let arg1 = ixir.dateToValue(ixir.Init(a));
	let arg2 = ixir.dateToValue(ixir.Init(b));
	return arg2 > arg1
};
ixir.isBefore = function(a,b){
	let arg1 = ixir.dateToValue(ixir.Init(a));
	let arg2 = ixir.dateToValue(ixir.Init(b));
	return arg2 < arg1
};
ixir.prototype.isBetween = function(arg1,arg2){
	let
		a1 = ixir.dateToValue(ixir.Init(arg1)),
		a2 = ixir.dateToValue(this.date),
		a3 = ixir.dateToValue(ixir.Init(arg2)),x,y;
	if(a1 < a2){
		x = a1;
		y = a3;
	}else{
		x = a3;
		y = a1;
	};
	if(x < a2 < y || x > a2 > y){
		return true;
	}else return false;
};
ixir.prototype.toString = ixir.date.prototype.toString = ixir.prototype.toIXIRFormat;
ixir.filter = function(timeFunction,date1,date2,func){
	let startdate = new ixir(date1),
		day1 = ixir.dateToValue(ixir.Init(date1)),
		day2 = ixir.dateToValue(ixir.Init(date2)),
		timeCount = day2 - day1,
		step = ixir.daySec(1),
		totalTime = 0,
		different,j,newDate;
	switch(timeFunction){
		case "hour":
			ixir.hourSec(1);
			break;
		case "day":
			ixir.daySec(1);
			break;
		case "month":
			ixir.monthSec(1);
			break;
		case "year":
			ixir.yearSec(1);
			break;
	};
	startdate.date.calculate();
	for(j = 0;j<timeCount;j+=step){
		newDate = startdate.add({second:j},true);
		newDate.date.calculate();
		if(func(newDate.date)){
			totalTime+=step;
		}
	};
	return totalTime/step;
};
ixir.loop = ixir.filter;
ixir.dayFilter = function(date1,date2,callback){
	return ixir.filter("day",date1,date2,callback)
};
ixir.hourFilter = function(date1,date2,callback){
	return ixir.filter("hour",date1,date2,callback)
};
ixir.monthFilter = function(date1,date2,callback){
	return ixir.filter("month",date1,date2,callback)
};
ixir.yearFilter = function(date1,date2,callback){
	return ixir.filter("year",date1,date2,callback)
};
hy.rgb = function(o){
	let crange = function(val){
		return Math.max(Math.min(val,255),0)
	}
	this.value = (o!=null && hy.rgb.init.apply(this,arguments)) || [0,0,0,255];
	this.add = function(out){
		out = out instanceof hy.rgb ? out.value : hy.rgb.init(out);
		this.value[0] = crange(this.value[0]+out[0]);
		this.value[1] = crange(this.value[1]+out[1]);
		this.value[2] = crange(this.value[2]+out[2]);
		if(out[3]) this.value[3] = crange(this.value[3]+out[3]);
		return this
	};
	this.reverse = function(){
		this.value[0] = crange(255 - this.value[0]);
		this.value[1] = crange(255 - this.value[1]);
		this.value[2] = crange(255 - this.value[2]);
		return this
	};
	this.setR = this.setRed = function(R){
		this.value[0] = crange(R);
		return this
	};
	this.setG = this.setGreen = function(G){
		this.value[1] = crange(G);
		return this
	};
	this.setB = this.setBlue = function(B){
		this.value[2] = crange(B);
		return this
	};
	this.setA = this.setAlpha = this.setOpacity = function(A){
		this.value[3] = crange(A);
		return this
	};
	this.different = function(out){
		out = out instanceof hy.rgb ? out.value : hy.rgb.init(out);
		this.value[0] = crange(this.value[0]-out[0]);
		this.value[1] = crange(this.value[1]-out[1]);
		this.value[2] = crange(this.value[2]-out[2]);
		if(out[3]) this.value[3] = crange(this.value[3]-out[3]);
		return this
	};
	this.summary = function(out){
		out = out instanceof hy.rgb ? out.value : hy.rgb.init(out);
		this.value[0] = crange((this.value[0]+out[0])/2);
		this.value[1] = crange((this.value[1]+out[1])/2);
		this.value[2] = crange((this.value[2]+out[2])/2);
		if(out[3]) this.value[3] = crange((this.value[3]-out[3])/2);
		return this
	};
	this.light = function(plus){
		this.value[0] = crange(this.value[0]+plus);
		this.value[1] = crange(this.value[1]+plus);
		this.value[2] = crange(this.value[2]+plus);
		this.value[3] = crange(this.value[3]+plus);
		return this
	};
	this.dark = function(plus){
		this.value[0] = crange(this.value[0]-plus);
		this.value[1] = crange(this.value[1]-plus);
		this.value[2] = crange(this.value[2]-plus);
		this.value[3] = crange(this.value[3]-plus);
		return this
	};
	this.toString = function(){
		if(this.value[3] == 0)
		{
			let t =  this.tohex6();
			if(hy.rgb.colors[t])
			{
				return hy.rgb.colors[t]
			};
		}
		return this.torgb();
	};
	this.tohex6 = function(){
		return this.value[3] != 0 ? ("#"+[
			("0"+this.value[0].toString(16)).slice(-2),
			("0"+this.value[1].toString(16)).slice(-2),
			("0"+this.value[2].toString(16)).slice(-2),
			(this.value[3]==0||this.value[3]==255?"":("0"+this.value[3].toString(16)).slice(-2))
		].join('')) : "transparent";
	};
	this.tohex3 = function(){
		return this.value[3] != 0 ? ("#"+[
			(this.value[0].toString(16)).slice(0,1),
			(this.value[1].toString(16)).slice(0,1),
			(this.value[2].toString(16)).slice(0,1),
			(this.value[3]==255?"":(this.value[3].toString(16)).slice(0,1))
		].join('')) : "transparent";
	};
	this.torgb = function(){
		return (
			this.value[3] == 255 ? 'rgb('+this.value.slice(0,3).join(', ')+')' :
			this.value[3] == 0 ? "transparent" : 'rgba('+this.value.join(', ')+')' 
		)
	};
	this.tohex = function(){
		if(this.value[0] % 16 == 0 && this.value[1] % 16 == 0 && this.value[2] % 16 == 0 && (this.value[3] == 255 || this.value[3] == 0 || this.value[3] % 16 == 0)){
			return this.tohex3()
		}else{
			return this.tohex6()
		}
	};
};
hy.rgb.init =  function(colorText,g,b){
	let x = parseInt,p = hy.rgb,v,k=[0,0,0,255];
	if(colorText!=null && g!=null && b!=null){
		k[0] = x(parseInt(colorText),10);
		k[1] = x(parseInt(g),10);
		k[2] = x(parseInt(b),10);
	}else if(v = p.hexreg.exec(colorText)){
		k[0] = x(v[1],16);
		k[1] = x(v[2],16);
		k[2] = x(v[3],16);
	}else if(v = p.hexareg.exec(colorText)){
		k[0] = x(v[1],16);
		k[1] = x(v[2],16);
		k[2] = x(v[3],16);
		k[3] = x(v[4],16);
	}else if(v = p.rgbreg.exec(colorText)){
		k[0] = x(v[1],10);
		k[1] = x(v[2],10);
		k[2] = x(v[3],10);
	}else if(v = p.rgbareg.exec(colorText)){
		k[0] = x(v[1],10);
		k[1] = x(v[2],10);
		k[2] = x(v[3],10);
		k[3] = x(v[4],10);
	}else if(typeof colorText == "string" && (v = hy.rgb.colors[colorText.toLowerCase()])){
		v = hy.rgb.hexreg.exec(v);
		k[0] = x(v[1],16);
		k[1] = x(v[2],16);
		k[2] = x(v[3],16);
	};
	k = k.map(function(i){
		return Math.max(Math.min(i,255),0)
	})
	return k;
};
hy.rgb.hexreg = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i;
hy.rgb.hexareg = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i;
hy.rgb.rgbreg = /^rgb\(\s*(\d+)\s*[\,\s+]\s*(\d+)\s*[\,\s+]\s*(\d+)\s*\)$/i;
hy.rgb.rgbareg = /^rgba\(\s*(\d+)\s*[\,\s+]\s*(\d+)\s*[\,\s+]\s*(\d+)\s*[\,\s+\/\\	]\s*(\d+)\s*\)$/i;
hy.rgb.colors = {
	"aliceblue": "#f0f8ff",
	"antiquewhite": "#faebd7",
	"aqua": "#00ffff",
	"aquamarine": "#7fffd4",
	"azure": "#f0ffff",
	"beige": "#f5f5dc",
	"bisque": "#ffe4c4",
	"black": "#000000",
	"blanchedalmond": "#ffebcd",
	"blue": "#0000ff",
	"blueviolet": "#8a2be2",
	"brown": "#a52a2a",
	"burlywood": "#deb887",
	"cadetblue": "#5f9ea0",
	"chartreuse": "#7fff00",
	"chocolate": "#d2691e",
	"coral": "#ff7f50",
	"cornflowerblue": "#6495ed",
	"cornsilk": "#fff8dc",
	"crimson": "#dc143c",
	"cyan": "#00ffff",
	"darkblue": "#00008b",
	"darkcyan": "#008b8b",
	"darkgoldenrod": "#b8860b",
	"darkgray": "#a9a9a9",
	"darkgreen": "#006400",
	"darkkhaki": "#bdb76b",
	"darkmagenta": "#8b008b",
	"darkolivegreen": "#556b2f",
	"darkorange": "#ff8c00",
	"darkorchid": "#9932cc",
	"darkred": "#8b0000",
	"darksalmon": "#e9967a",
	"darkseagreen": "#8fbc8f",
	"darkslateblue": "#483d8b",
	"darkslategray": "#2f4f4f",
	"darkturquoise": "#00ced1",
	"darkviolet": "#9400d3",
	"deeppink": "#ff1493",
	"deepskyblue": "#00bfff",
	"dimgray": "#696969",
	"dodgerblue": "#1e90ff",
	"firebrick": "#b22222",
	"floralwhite": "#fffaf0",
	"forestgreen": "#228b22",
	"fuchsia": "#ff00ff",
	"gainsboro": "#dcdcdc",
	"ghostwhite": "#f8f8ff",
	"gold": "#ffd700",
	"goldenrod": "#daa520",
	"gray": "#808080",
	"green": "#008000",
	"greenyellow": "#adff2f",
	"honeydew": "#f0fff0",
	"hotpink": "#ff69b4",
	"indianred": "#cd5c5c",
	"indigo": "#4b0082",
	"ivory": "#fffff0",
	"khaki": "#f0e68c",
	"lavender": "#e6e6fa",
	"lavenderblush": "#fff0f5",
	"lawngreen": "#7cfc00",
	"lemonchiffon": "#fffacd",
	"lightblue": "#add8e6",
	"lightcoral": "#f08080",
	"lightcyan": "#e0ffff",
	"lightgoldenrodyellow": "#fafad2",
	"lightgreen": "#90ee90",
	"lightgrey": "#d3d3d3",
	"lightpink": "#ffb6c1",
	"lightsalmon": "#ffa07a",
	"lightseagreen": "#20b2aa",
	"lightskyblue": "#87cefa",
	"lightslategray": "#778899",
	"lightsteelblue": "#b0c4de",
	"lightyellow": "#ffffe0",
	"lime": "#00ff00",
	"limegreen": "#32cd32",
	"linen": "#faf0e6",
	"magenta": "#ff00ff",
	"maroon": "#800000",
	"mediumaquamarine": "#66cdaa",
	"mediumblue": "#0000cd",
	"mediumorchid": "#ba55d3",
	"mediumpurple": "#9370d8",
	"mediumseagreen": "#3cb371",
	"mediumslateblue": "#7b68ee",
	"mediumspringgreen": "#00fa9a",
	"mediumturquoise": "#48d1cc",
	"mediumvioletred": "#c71585",
	"midnightblue": "#191970",
	"mintcream": "#f5fffa",
	"mistyrose": "#ffe4e1",
	"moccasin": "#ffe4b5",
	"navajowhite": "#ffdead",
	"navy": "#000080",
	"oldlace": "#fdf5e6",
	"olive": "#808000",
	"olivedrab": "#6b8e23",
	"orange": "#ffa500",
	"orangered": "#ff4500",
	"orchid": "#da70d6",
	"palegoldenrod": "#eee8aa",
	"palegreen": "#98fb98",
	"paleturquoise": "#afeeee",
	"palevioletred": "#d87093",
	"papayawhip": "#ffefd5",
	"peachpuff": "#ffdab9",
	"peru": "#cd853f",
	"pink": "#ffc0cb",
	"plum": "#dda0dd",
	"powderblue": "#b0e0e6",
	"purple": "#800080",
	"red": "#ff0000",
	"rosybrown": "#bc8f8f",
	"royalblue": "#4169e1",
	"saddlebrown": "#8b4513",
	"salmon": "#fa8072",
	"sandybrown": "#f4a460",
	"seagreen": "#2e8b57",
	"seashell": "#fff5ee",
	"sienna": "#a0522d",
	"silver": "#c0c0c0",
	"skyblue": "#87ceeb",
	"slateblue": "#6a5acd",
	"slategray": "#708090",
	"snow": "#fffafa",
	"springgreen": "#00ff7f",
	"steelblue": "#4682b4",
	"tan": "#d2b48c",
	"teal": "#008080",
	"thistle": "#d8bfd8",
	"tomato": "#ff6347",
	"turquoise": "#40e0d0",
	"violet": "#ee82ee",
	"wheat": "#f5deb3",
	"white": "#ffffff",
	"whitesmoke": "#f5f5f5",
	"yellow": "#ffff00",
	"yellowgreen": "#9acd32"
};
for(let name in hy.rgb.colors) hy.rgb.colors[hy.rgb.colors[name]] = name;
hy.toHtmlEntities = function(str) {
    return str.replace(/[\u00A0-\u9999<>\&]/gm, function(s) {
        return "&#" + s.charCodeAt(0) + ";";
    });
};
hy.fromHtmlEntities = function(string) {
    return (string+"").replace(/&#(\d+);/gm,function(s,k) {
        return String.fromCharCode(k);
    })
};

hy.idle = function(func){
	(window.requestIdleCallback || function(f){setTimeout(f,1)})(func);
};
hy.idle.loop = function(func){
	function a(){
		if(func() != hy.idle.loop.break){
			hy.idle(a);
		};
	};
	hy.idle(a);
};
hy.idle.loop.break = -773;
/**
 * @param {{root:HTMLElement,margin:String,threshold:Array<Number>|Number,target:HTMLElement}} option
 */
hy.intersectionOBServer = function(option){
	let pr = new hy.Promise();
	hy(option.target).each(function(){
		let options = {
			root:option.root,
			rootMargin: option.margin,
			threshold: option.threshold
		};
		new IntersectionObserver(function(opt){
			opt.forEach(function(iobs){
				hy.idle(function(){
					if(iobs.intersectionRatio != 0){
						pr.call("screen.in",iobs);
					}else{
						pr.call("screen.out",iobs);
					}
				});
			})
		}, options).observe(this);
	});
	return pr;
};
hy._sharpFlex = function(e,value){
	if(value.indexOf('flex') != -1) e.style["display"] = "flex";
	else if(value.indexOf('inline-flex') != -1)e.style["display"] = "inline-flex";
	if(value.indexOf('row') != -1) e.style["flex-direction"] = "row";
	else if(value.indexOf('row-reverse') != -1) e.style["flex-direction"] = "row-reverse";
	else if(value.indexOf('column') != -1) e.style["flex-direction"] = "column";
	else if(value.indexOf('column-reverse') != -1) e.style["flex-direction"] = "column-reverse";
	if(value.indexOf('fill') != -1) e.style["flex"] = "1 1 auto";
	else if(value.indexOf('min') != -1) e.style["flex"] = "0 0 auto";
	if(value.indexOf('wrap-reverse') != -1) e.style["flex-wrap"] = "wrap-reverse";
	else if(value.indexOf('nowrap') != -1) e.style["flex-wrap"] = "nowrap";
	else if(value.indexOf('wrap') != -1) e.style["flex-wrap"] = "wrap";
	return e;
}

'[node Version(2.360.700110) Next]';

hy.css = function()
{

};
hy.css.style = hy.Element("style",{$hy:{version:2.17,lib:"ui",min:false,type:"javascript"}},"html>head").first();
hy.css.variableDom = document.createTextNode(':root{\n}');
hy.css.var = function(name,value){
	if(value == undefined)
	{
		return "var(--"+name+")";
	}
	hy.css.vars[name] = value;
	hy.css.updateVars();
};
hy.css.vars = {};
hy.css.updateVars = function(){
	let vars = [];
	for(var name in hy.css.vars)
	{
		let value = hy.css.vars[name];
		vars.push("--"+name+":"+value);
	};
	let cssText = vars.join(';');
	hy.css.variableDom.textContent = "body{"+cssText+"}";
};
hy.css.style.append(hy.css.variableDom);


hy.css.hiddenRules = false;
hy.css.lazyCompile = true;
hy.css.insertRule = function(cssRule){
	if(hy.css.hiddenRules) hy.css.style.sheet.insertRule(cssRule);
	else return hy.css.style.appendChild(document.createTextNode(cssRule))
};
hy.css.importCss = function(url){
    hy.css.insertRule("@import url('"+url+"');")
};
hy.css.importFont = function(name,font){
    hy.css.insertRule("@font-face{font-family: '"+name+"';src: url('"+font+"');}")
};

hy.css.add = function(name,css){
	if(typeof name == "string")
	{
		if(!hy.css.rules[name]) hy.css.rules[name] = css;
	}else for(let i in name){
		if(!hy.css.rules[i]) hy.css.rules[i] = name[i];
	}
};
hy.css.rules = {};
hy.css.merge = function(str){
	let mergeCss = [];
	let cssRules = {};
	let extendMerge = function(rule){
		if(!rule || !rule.extend) return;
		if(typeof rule.extend == "string") rule.extend = rule.extend.split(/\s+/g);

		rule.extend.map(function(cssName){
			if(!mergeCss.includes(cssName))
			{
				hy.deepCopy(cssRules,hy.css.rules[cssName],false,hy.deepCopy.cssCopier)
				mergeCss.push(cssName);
				extendMerge(hy.css.rules[cssName]);
			}
		})
		delete rule.extend;
	}
	extendMerge(
		typeof str == "string" ? {extend:str.split(/\s+/)} :
		str instanceof Array ? {extend:str} : str
	);
	delete cssRules.extend;
	return {
		rule:cssRules,
		merged:mergeCss
	};
}
hy.css.beautify = false;
hy.css.serialize = function(rule,pattern,parseMode){
	/**
	 * Compiling json
	 */
	let rules = [];
	let anim = [];
	let medias = [];
	let _useVariables = {};
	pattern = (pattern||"").replace(/\$\{id\}/i,function(sid,m){
		return id
	})
	let b = hy.css.beautify;
	let tab = '';
	let s = b?' ':'';
	let lef = b?'\n':'';
	let tb = function(n){
		b && (tab = Array(tab.length+n).fill("\t").join(''))
	};
	let compileValue = function(name){
		typeof name == "function" && (name = name());
		name=name.toString();
		if(name.charAt(0) == '*' && name.charAt(1) == '*')
		{
			let id;
			if(!_useVariables[name.slice(2)])
			{
				id = _useVariables[name.slice(2)]=hy.css.createId();
			}else id = _useVariables[name.slice(2)];
			return id;
		}
		else return name;
	};
	let initializeScope = function(scope){
		if(scope['#flex'] != null){
			let value = scope['#flex'];
			if(value.indexOf('flex') != -1) scope["display"] = "flex";
			else if(value.indexOf('inline-flex') != -1)scope["display"] = "inline-flex";
			if(value.indexOf('row') != -1) scope["flex-direction"] = "row";
			else if(value.indexOf('row-reverse') != -1) scope["flex-direction"] = "row-reverse";
			else if(value.indexOf('column') != -1) scope["flex-direction"] = "column";
			else if(value.indexOf('column-reverse') != -1) scope["flex-direction"] = "column-reverse";
			if(value.indexOf('fill') != -1) scope["flex"] = "1 1 auto";
			else if(value.indexOf('min') != -1) scope["flex"] = "0 0 auto";
			if(value.indexOf('wrap-reverse') != -1) scope["flex-wrap"] = "wrap-reverse";
			else if(value.indexOf('nowrap') != -1) scope["flex-wrap"] = "nowrap";
			else if(value.indexOf('wrap') != -1) scope["flex-wrap"] = "wrap";
			value.replace(/justify:(\w+)/ig,function(_,i){
				scope["justify-content"] = i;
			});
			delete scope['#flex'];
		}
	};
	let compileScope = function(scope){
		let result = "";
		initializeScope(scope);
		for(let name in scope)
		{
			let t = scope[name];
			if(typeof t == "string" || typeof t == "function" || typeof t == "number")
			{
				result += tab+name+s+':'+s+compileValue(t)+";"+lef;
			}
			else
			{
				let c = [name];
				let trans = function(name,val){
					if(typeof val == "object")
					{
						c.push(name);
						for(let uname in val) trans(uname,val[uname])
						c.pop();
					}
					else
					{
						if(name != '#') c.push(name);
						result += tab+c.join('-')+s+":"+s+compileValue(val)+";"+lef;
						if(name != '#') c.pop();
					}
				};
				for(let uname in t){
					trans(uname,t[uname]);
				}
			}
		};
		return result;
	};
	let compileRule = function(name,scope){
		let result = "";
		result += tab+name+s+"{"+s+lef;
		tb(+1);
		result += compileScope(scope);
		tb(-1);
		result += tab+"}"+lef;
		return result;
	};
	let compileAnimation = function(id,obj){
		let animText = tab+"@keyframes "+id+s+"{"+s+lef;
		tb(+1);
		for(let attempt in obj)
		{
			animText += tab+attempt+s+"{"+s+lef;
			tb(+1);
			animText += compileScope(obj[attempt]);
			tb(-1);
			animText += tab+"}"+lef;
		}
		tb(-1);
		animText += tab+"}"+lef;
		anim.push({
			name:id,
			css:animText
		})
	};
	let compileScopelet = function(cssRules){
		let css = "";
		if(cssRules.style) css += compileRule(pattern,cssRules.style);
		for(let name in cssRules) if(name == "style") continue;
		else{
			let kname=name.replace(/\$id/,function(i){return pattern});
			let c = name.charAt(0);
			switch(c)
			{
				case '&':{
					let selector = kname.slice(1).split(/,/g).map(function(sname){
						return pattern+sname;
					}).join(","+lef+tab);
					css += compileRule(selector,cssRules[name]);
					break;
				}
				case '@':{
					let k;
					if(k = /@animation ([\w\-\_]+)/.exec(name))
					{
						let id;
						if(!_useVariables[k[1]])
						{
							id = _useVariables[k[1]]=hy.css.createId();
						}else id = _useVariables[k[1]];
						hy.css.variables[k[1]] = {
							raw:compileAnimation(id,cssRules[sname]),
							id:id
						};
					}else if(k = /@media\(([^\)]+)\)/.exec(name)){
						let medianame = "",mediacss="";
						medianame += tab+"@media";
						let _t = {w:"width",h:"height"},i = 0;
						k[1].split(',').map(function(mediad){
							if(i++ != 0) css += ","+s;
							let size = mediad.split(/\s+/);
							if(size.length == 1)
							{
								let style = _t[size[0].charAt(0)];
								let len = size[0].slice(1);
								medianame += "(max-"+style+":"+len+"px)"
							}else{
								let style = _t[size[0].charAt(0)];
								let len = size[0].slice(1);
								medianame += "(min-"+style+":"+len+"px)"
								style = _t[size[1].charAt(0)];
								if(style){
									len = size[1].slice(1);
									medianame += " and (max-"+style+":"+len+"px)"
								}
							};
						})
						mediacss += medianame+lef+tab+"{"+lef;
						tb(+1);
						mediacss += compileScopelet(cssRules[name]);
						tb(-1);
						mediacss += "}"+lef;
						css += mediacss;
					}
					break;
				};
				default:{
					let selector = kname.split(/,/g).map(function(sname){
						return pattern+sname;
					}).join(","+lef+tab);
					css += compileRule(selector,cssRules[name]);
					break;
				}
			}
		};
		return css;
	};
	let compileBase = function(cssRules){
		if(cssRules.style){
			rules.push({
				name:pattern,
				css:compileRule(pattern,cssRules.style),
				raw:{style:cssRules.style}
			})
		}
		for(let name in cssRules) if(name == "style") continue;
		else{
			let kname=name.replace(/\$id/,function(i){return pattern});
			let c = name.charAt(0);
			switch(c)
			{
				case '&':{
					let selector = kname.slice(1).split(/,/g).map(function(sname){
						return pattern+sname;
					}).join(","+lef+tab);
					rules.push({
						name:selector,
						css:compileRule(selector,cssRules[name]),
						raw:{[kname]:cssRules[name]}
					})
					break;
				}
				case '@':{
					let k;
					if(k = /@animation ([\w\-\_]+)/.exec(name))
					{
						let id;
						if(!_useVariables[k[1]])
						{
							id = _useVariables[k[1]]=hy.css.createId();
						}else id = _useVariables[k[1]];
						hy.css.variables[k[1]] = {
							raw:compileAnimation(id,cssRules[sname]),
							id:id
						};
					}else if(k = /@media\(([^\)]+)\)/.exec(name)){
						let medianame = "",mediacss="";
						medianame += tab+"@media ";
						let _t = {w:"width",h:"height"},i = 0;
						k[1].split(',').map(function(mediad){
							if(i++ != 0) css += ","+s;
							let size = mediad.split(/\s+/);
							if(size.length == 1)
							{
								let style = _t[size[0].charAt(0)];
								let len = size[0].slice(1);
								medianame += "(max-"+style+":"+len+"px)"
							}else{
								let style = _t[size[0].charAt(0)];
								let len = size[0].slice(1);
								medianame += "(min-"+style+":"+len+"px) and "
								style = _t[size[1].charAt(0)];
								len = size[1].slice(1);
								medianame += "(max-"+style+":"+len+"px)"
							};
						});
						mediacss += medianame+lef+tab+"{"+lef;
						tb(+1);
						mediacss += compileScopelet(cssRules[name]);
						tb(-1);
						mediacss += "}"+lef;
						medias.push({
							name:medianame,
							css:mediacss,
							raw:{[name]:cssRules[name]}
						})
					}
					break;
				};
				default:{
					let selector = kname.split(/,/g).map(function(sname){
						return pattern+sname;
					}).join(","+lef+tab);
					rules.push({
						name:selector,
						css:compileRule(selector,cssRules[name]),
						raw:{[kname]:cssRules[name]}
					})
					break;
				}
			}
		};
	};
	if(parseMode)
	{
		compileBase(rule);
		return {
			rules:rules,
			anim:anim,
			medias:medias,
			variables:Object.values(_useVariables)
		};
	}else{
		return {css:compileScopelet(rule)};
	}
}
hy.css.variables = {};
hy.css.createId = function(){
	let rnumber = function(){
		return parseInt(65 + Math.random() * 10)
	};
	let bigLet = function(){
		return String.fromCharCode(parseInt(65 + Math.random() * 24))
	};
	let smLet = function(){
		return String.fromCharCode(parseInt(97 + Math.random() * 24))
	};
	let randLet = function(){
		return [rnumber,bigLet,smLet][parseInt(Math.random() * 10) % 3]();
	};
	return bigLet()+Array(5).fill(0).map(function(){return randLet()}).join('')
}
hy.css.ids = {};  ""
hy.css.vdomcss = {};
hy.css.vdom = {};
/*
	hy.css.use("border sizer c-flex",true)  ---> uSeiyZ
	hy.css.use("border sizer c-flex",false)  ---> uS yZ Za
 */
hy.css.use = function(ids,merging){
	if(merging == null)
	{
		// class variable oluştur
		// input flex focus  input/flex/focus
		let mergeCode = (typeof ids == "string" ? ids.split(/\s+/g) : ids).sort();
		// daha önce variable oluşturulmuş ise al
		if(hy.css.ids[mergeCode.join('/')])
		{
			// daha önce oluşturulmuş variable idsi 
			// input/flex/focus  -->   tr e2
			return hy.css.ids[mergeCode.join('/')];
		}
		else
		{
			// id üret ef4
			let creativeId = hy.css.createId();

			// id üret ef4 = input/flex/focus
			hy.css.ids[mergeCode.join('/')] = creativeId;

			// Tüm sınıfları tek bir isim kural altında birleştir
			let merged = hy.css.merge(ids);

			// JSON kuralları css kurallarına dönüştür {css:String}
			let rule = "."+creativeId;
			let css = hy.css.serialize(merged.rule,rule);
			// JSON metaverisi gönder
			css.raw = merged;

			if(hy.css.vdom[rule])
			{
				hy.css.vdom[rule].innerHTML = css.css;
			}else{
				hy.css.vdom[rule] = document.createTextNode(css.css);
				hy.css.style.append(hy.css.vdom[rule]);
			};
			return creativeId;
		}
	}
	else
	{
		// class variable oluştur
		// input flex focus  input/flex/focus
		let classid = [];
		let mc = (typeof ids == "string" ? ids.split(/\s+/g) : ids).sort();
		mc.map(function(id){
			// class variable oluştur
			// input flex focus  input/flex/focus
			let mergeCode = [id];
			// daha önce variable oluşturulmuş ise al
			if(hy.css.ids[mergeCode.join('/')])
			{
				// daha önce oluşturulmuş variable idsi 
				// input/flex/focus  -->   tr e2
				classid.push(hy.css.ids[mergeCode.join('/')]);
			}
			else
			{
				// id üret ef4
				let creativeId = hy.css.createId();

				// id üret ef4 = input/flex/focus
				hy.css.ids[mergeCode.join('/')] = creativeId;

				// Tüm sınıfları tek bir isim kural altında birleştir
				let merged = hy.css.merge(ids);

				// JSON kuralları css kurallarına dönüştür {css:String}
				let rule = "."+creativeId;
				let css = hy.css.serialize(merged.rule,rule);
				// JSON metaverisi gönder
				css.raw = merged;

				if(hy.css.vdom[rule])
				{
					hy.css.vdom[rule].innerHTML = css.css;
				}else{
					hy.css.vdom[rule] = document.createTextNode(css.css);
					hy.css.style.append(hy.css.vdom[rule])
				};
				classid.push(creativeId);
			}
		});
		return classid.sort().join(' ')
	}
};
let indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
let IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;

hy.filedb = function(){};
hy.filedb._events = [];
hy.filedb.scope = function(a){
    if(!hy.filedb.ready) hy.filedb._events.push(a);
    else a();
};

hy.filedb.dbrequest = indexedDB.open("hy2files","1.0");
hy.filedb.ready = false;
hy.filedb.dbrequest.onupgradeneeded = function (event) {
    var files = event.target.result.createObjectStore("files",{keyPath:"name"});
    files.createIndex("name","name");
    files.createIndex("data","data");
};
hy.filedb.dbrequest.onsuccess = function(event) {
    hy.filedb.db = hy.filedb.dbrequest.result;
    hy.filedb.ready = true;
    hy.filedb._events.map(function(i){i()})
};
hy.filedb.addData = function(name,file){
    var objectStore = hy.filedb.db.transaction(['files'], 'readwrite').objectStore('files');
    return new Promise(function(ok){
        let tr = objectStore.add({
            name:name,
            file:file
        });
        tr.onsuccess = function(event){
            ok(event.target.result)
        };
        tr.onerror = function(event){
            ok(false)
        };
    });
}
hy.filedb.clear = function(name,file){
    var objectStore = hy.filedb.db.transaction(['files'], 'readwrite').objectStore('files');
    return new Promise(function(ok){
        let tr = objectStore.clear();
        tr.onsuccess = function(event){
            ok(event.target.result)
        };
        tr.onerror = function(event){
            ok(false)
        };
    });
}
hy.filedb.replaceData = function(name,file){
    var objectStore = hy.filedb.db.transaction(['files'], 'readwrite').objectStore('files');
    return new Promise(function(ok){
        let tr = objectStore.put({
            name:name,
            file:file
        })
        tr.onsuccess = function(event){
            ok(event.target.result)
        };
        tr.onerror = function(event){
            ok(false)
        };
    });
}
hy.filedb.getData = function(name){
    var objectStore = hy.filedb.db.transaction(['files'], 'readwrite').objectStore('files');
    return new Promise(function(ok){
        let tr =  objectStore.get(name).onsuccess = function(event){
            ok(event.target.result && event.target.result.file)
        };
        tr.onsuccess = function(event){
            ok(event.target.result)
        };
        tr.onerror = function(event){
            ok(false)
        };
    });
};
hy.filedb.fetch = async function(url){
    let tr = new URL(url,window.location).toString(),blob;
    if(blob = await hy.filedb.getData(url))
    {
        return blob;
    }else{
		let request = await fetch(tr);
		let data = await request.blob();
        await hy.filedb.addData(url,data);
        return data;
    }
};