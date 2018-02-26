function deleteGod(id){
    $.ajax({
        url: '/gods/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};