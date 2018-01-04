$("#test").click(function () {

    console.log($("#post_in-form").serialize())

    $.post("lease", $("#post_in-form").serialize(), function (result) {

        console.log(result)
    })
})
