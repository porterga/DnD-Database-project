function updateFavor(id, id2){
    $.ajax({
        url: '/favors/' + id + id2,
        type: 'PUT',
        data: $('#update-favor').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};