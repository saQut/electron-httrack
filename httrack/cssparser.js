/**
 * @param {String} cssContent
 * @param {Page} htPage
 * @returns {String}
 */
function cssParse(cssContent,htPage)
{
    var css = (cssContent
        .replace(/@import\s*'([^']+)'|@import\s*"([^"]+)"|@import\s*url\('([^']+)'\)|@import\s*url\("([^"]+)"\)|@import\s*url\(([^\)]+)\)/g,(_,a,b,c,d,e)=>{
            var tt = a || b || c || d || e;
            return realUrl(tt) ? _.replace(tt,htPage("addCss",tt)) : _;
        })
        .replace(/url\('([^']+)'\)|url\("([^"]+)"\)|url\(([^\)]+)\)/g,(_,a,b,c)=>{
            var tt = a || b || c;
            return realUrl(tt) ? _.replace(tt,htPage("addFile",tt)) : _;
        })
    );
    return css;
}
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

module.exports = cssParse;