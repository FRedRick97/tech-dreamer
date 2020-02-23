$(function () {
    var error = function () {
        $(this)
            .css('box-shadow', '1px 1px 5px red')
            .css('border', '1px solid red');
    };

    $('#form input').blur(function () {
        var input = $(this).val();
        console.log(input);
        if (input === '') {
            $(this).css('box-shadow', '1px 1px 5px red').css('border', '1px solid red');
        }
    });
});
