const cheerio = require("cheerio");
const cssparser = require("./cssparser");
var {Worker,workerData,isMainThread,parentPort} = require("worker_threads");

/**
 * 
 * @param {String} htmlContent 
 * @param {Page} htPage
 * @returns {String}
 */
function parse(htmlContent,htPage)
{
    let $ = cheerio.load(htmlContent);
    $("link[rel='stylesheet'][href]").map((i,elem)=>{
        var T = "href", A = "attr", isUrl = true, L = "addCss";
        var t = $(elem)[A](T);
        if(t){
            if(isUrl && !realUrl(t)) return;
            $(elem)[A](T,htPage(L,t));
        }
    })
    $("img[data-src]").map(function(i,elem){
        var T = "data-src", A = "attr", isUrl = true, L = "addFile";
        var t = $(elem)[A](T);
        if(t){
            if(isUrl && !realUrl(t)) return;
            $(elem)[A](T,htPage(L,t));
        }
    })
    $("a[href]").map((i,elem)=>{
        var T = "href", A = "attr", isUrl = true, L = "addPage";
        var t = $(elem)[A](T);
        if(t){
            if(isUrl && !realUrl(t)) return;
            $(elem)[A](T,htPage(L,t));
        }
    })
    $("img[src],script[src],video[src],video>source[src],audio[src],audio>source[src]").map((i,elem)=>{
        var T = "src", A = "attr", isUrl = true, L = "addFile";
        var t = $(elem)[A](T);
        if(t){
            if(isUrl && !realUrl(t)) return;
            $(elem)[A](T,htPage(L,t));
        }
    })
    $("link[href]:not([rel='stylesheet'])").map((i,elem)=>{
        var T = "href", A = "attr", isUrl = true, L = "addFile";
        var t = $(elem)[A](T);
        if(t){
            if(isUrl && !realUrl(t)) return;
            $(elem)[A](T,htPage(L,t));
        }
    });
    $("[value^='http']").map((i,elem)=>{
        var T = "value", A = "attr", isUrl = true, L = "addPage";
        var t = $(elem)[A](T);
        if(t){
            if(isUrl && !realUrl(t)) return;
            $(elem)[A](T,htPage(L,t));
        }
    });
    $("style").map((i,elem)=>{
        var content = $(elem).html();
        $(elem).html(cssparser(content,htPage));
    });
    $("[style]").map((i,elem)=>{
        var content = $(elem).attr("style");
        $(elem).attr("style",cssparser(content,htPage));
    });
    $("[integrity]").removeAttr("integrity");
    $("[crossorigin]").removeAttr("crossorigin");
    return $.html({
        decodeEntities:true
    });
};


function realUrl(im)
{
    if(!/^data:|^javascript:|^mailto:|^#/i.test(im))
    {
        try{
            var test = new URL(im,"http://a11.b22/c33?d44#e55/");
            if(test.href == "http://a11.b22/c33?d44#e55/")
            {
                return false;
            }else{
                return true;
            }
        }catch(i){
            return false;
        }
    }else return false;
}

if(false)
{
    async function main()
    {
        var html = parse(workerData,(func,data)=>{
            parentPort.postMessage([func,data]);
        })
        parentPort.postMessage(["html",html]);
    };
    if(!isMainThread) main();

    module.exports = async function(htmlContent,htPage){
        var th = new Worker(__filename,{
            workerData:htmlContent
        });
        var str = null;
        return await new Promise(ok=>{
            th.on("message",(a)=>{
                if(a[0] != 'html') htPage[a[0]](a[1]);
                else{
                    ok(a[1])
                };
            })
        })
    };
}else{
    module.exports = async function(htmlContent,htPage){
        return parse(htmlContent,(func,data)=>{
            return htPage[func](data);
        })
    };
}