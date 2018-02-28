function updateWeapon(id){
    $.ajax({
        url: '/weapons/' + id,
        type: 'PUT',
        data: $('#update-weapon').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};