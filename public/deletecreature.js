function deleteCreature(id){
    $.ajax({
        url: '/creatures/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};