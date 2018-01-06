$("#test").click(function () {

    console.log($("#post_in-form").serialize())

    $.post("lease", $("#post_in-form").serialize(), function (result) {
        console.log(result)
        swal({
            title: '刊登成功',
            text: '房屋編號:A2342255\n',
            type: 'success',
        }).then(() => {
            window.location = '/house'
        })
    })
})
