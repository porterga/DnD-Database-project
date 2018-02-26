function updateGod(id){
    $.ajax({
        url: '/gods/' + id,
        type: 'PUT',
        data: $('#update-god').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};