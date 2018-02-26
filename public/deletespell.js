function deleteSpell(id){
    $.ajax({
        url: '/spells/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};