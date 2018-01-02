$("#test").click(function () {

    console.log($("#sign_up-form").serialize())

    $.post("sign_up", $("#sign_up-form").serialize(), function (result) {

        console.log(result)

        if (result.type)
            swal({
                title: result.inf,
                text: '即將導向回首頁',
                type: 'success',
                closeOnConfirm: false
            }).then(() => {
                window.location = '/'
            })
        else {
            swal({
                title: result.inf,
                text: '請換一個帳號',
                type: 'warning',
            })
        }
    })
})
