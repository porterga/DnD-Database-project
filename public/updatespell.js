function updateSpell(id){
    $.ajax({
        url: '/spells/' + id,
        type: 'PUT',
        data: $('#update-spell').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};