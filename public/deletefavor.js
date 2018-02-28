function deleteCreature(id, id2){
    $.ajax({
        url: '/favors/' + id + id2,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};