$(document).ready(function(){
  // Init mobile collapable navbar
  $('.sidenav').sidenav();

  // Transaction input
  $('.trans-input').on('keyup change', function(e) {
    console.log(e.target.value);
  })

  $('.firestore-send').on('click', function() {
    var email = $(this).data('email');
    var target =  $(this).closest('tr').find('input.firestore-input[data-email="' + email + '"]');
    console.log(target.val());
  })
});