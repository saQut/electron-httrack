const fs = require("fs");
const path = require("path");

const http = require("http");
const https = require("https");

const zlib = require("zlib");
/**
 * @returns {Boolean}
 */
async function downloadFile(url,refferer,file)
{
    var http = detectProtocol(url);
    if(!http) return false;
    const req = http.get(url,{
        headers: refferer ? Object.assign({Referer:refferer},defaultHeader) : defaultHeader
    });
    return await new Promise(ok => {
        var result = false;
        req.on("timeout",()=>{ok(false);});
        req.on("abort",()=>{ok(false);});
        req.on("error",()=>{ok(false);})
        req.on("response",async (res)=>{
            res.on("error",()=>{ok(false)});
            if(res.statusCode == 200)
            {
                var stream = res;
                switch(res.headers["content-encoding"])
                {
                    case "br": stream = stream.pipe(zlib.createBrotliDecompress());break;
                    case "deflate": stream = stream.pipe(zlib.createInflate());break;
                    case "gzip": stream = stream.pipe(zlib.createGunzip());break;
                }
                await createUnexistsDir(path.dirname(file));
                stream.pipe(fs.createWriteStream(file))
                    .on("finish",()=>{ok(true)})
                    .on("error",()=>{ok(false)});
            }else ok(false);
        });
    })
}
async function saveFile(data,file)
{
    return await new Promise(async ok => {
        await createUnexistsDir(path.dirname(file));
        let stream = fs.createWriteStream(file)
            .on("finish",()=>{ok(true)})
            .on("error",()=>{ok(false)});
        stream.write(data);
        stream.close();
    })
}
/**
 * @returns {Buffer|Boolean}
 */
async function downloadData(url,refferer,step)
{
    var http = detectProtocol(url);
    if(!http) return;
    step("Sunucuya bağlanıyor...");
    const req = http.get(url,{
        headers: refferer ? Object.assign({Referer:refferer},defaultHeader) : defaultHeader
    });
    return await new Promise(ok => {
        req.on("timeout",()=>{
            step("Zaman aşımı hatası")
            ok(false)
        });
        req.on("abort",()=>{
            step("Bağlantı kesildi")
            ok(false)
        });
        req.on("error",(err)=>{
            step(err.message)
            ok(false)
        })
        req.on("response",(res)=>{
            step("Bağlandı [IP:"+res.connection.remoteAddress+"]");
            res.on("error",(err)=>{
                step(err.message)
                ok(false)
            });
            if(res.statusCode == 200)
            {
                var stream = res;
                switch(res.headers["content-encoding"])
                {
                    case "br": stream = stream.pipe(zlib.createBrotliDecompress());break;
                    case "deflate": stream = stream.pipe(zlib.createInflate());break;
                    case "gzip": stream = stream.pipe(zlib.createGunzip());break;
                };
                var buf = [];
                stream.on("error",()=> ok(false));
                stream.on("data",(chunk) => {
                    buf.push(chunk);
                    if(buf.length == 1) step("Veri alınıyor... [IP:"+res.connection.remoteAddress+"]");
                });
                stream.on("end",()=>{
                    ok(
                        Buffer.concat(buf)
                    )
                })
            }else{
                step("Sunucu yönlendirmesi "+res.statusCode+" ("+res.statusMessage+") [TO:"+res.headers.location+"]");
                ok(false)
            }
        });
    })
}
/**
 * @returns {import("http")}
 */
function detectProtocol(url)
{
    var t = new URL(url);
    return t.protocol == 'https:' ? https : (
        t.protocol == 'http:' ? http : false
    );
}

var defaultHeader = {
	"Accept": "*/*",
	"Accept-Encoding": "gzip, deflate, br",
	"Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
	"Cache-Control": "no-cache",
    "DNT": "1",
	"Pragma": "no-cache",
	"Sec-Fetch-Site": "same-origin",
	"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36",
};

exports.downloadData = downloadData;
exports.downloadFile = downloadFile;
exports.saveFile = saveFile;
async function createUnexistsDir(dir)
{
    return await new Promise(ok=>{
        fs.mkdir(dir,{
            recursive:true
        },()=>{
            ok()
        })
    })
};
