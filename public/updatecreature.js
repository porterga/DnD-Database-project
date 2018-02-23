function updateCreature(id){
    $.ajax({
        url: '/creatures/' + id,
        type: 'PUT',
        data: $('#update-creature').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};