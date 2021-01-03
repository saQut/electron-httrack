hy("body").add({
    $:"div",
    uicss:{
        style:{
            width:"100%",
            padding:"5px",
            '#flex':"flex column"
        }
    },
    xin:[
        urlSelect({
            $id:"value"
        }),
        filledFlex,
        {
            $:"div",
            uicss:{
                style:{
                    '#flex':"flex row"
                }
            },
            xin:[filledFlex,{
                $:"button",
                uicss:"btn",
                $id:"btnCancel",
                $class:"right",
                html:"İptal"
            },{
                $:"button",
                $id:"btnOk",
                uicss:"btn",
                html:"Tamam"
            }]
        }
    ]
});
hy("#btnCancel").click(function(){
    ipcRenderer.invoke("reply-cancel")
});
hy("#btnOk").click(function(){
    var val = hy("#value").attr("url");
    ipcRenderer.invoke("reply-ok",val)
})
hy(document.body).keyup(function(event){
    if(event.key == "Escape")
    {
        setTimeout(function(){
            window.close();
        },0)
    }
})