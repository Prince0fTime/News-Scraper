$(document).on("click", "#noteBtn", function () {
  var thisId = $(this).attr("data-id");

  $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
    .then(function (data) {
      console.log(data);

      $('#noteModal').modal('toggle')
      $("#noteModalLabel").text(data.title);
      $(".note").empty();

      if (data.note) {
        console.log(data.note._id)

        $(".note").data("id", data.note._id);
        $(".note").append("<p>Title: " + data.note.title + "</p>");
        $(".note").append("<p>Note: " + data.note.body + "</p>");
      }

      $(document).on("click", "#savenote", function () {
        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
              // Value taken from title input
              title: $(".titleinput").val(),
              // Value taken from note textarea
              body: $(".bodyinput").val()

            }
          })
          .then(function (data) {
            console.log(data);
            $(".note").empty();
            $(".note").append("<p>Title: " + $(".titleinput").val() + "</p>");
            $(".note").append("<p>Note: " + $(".bodyinput").val() + "</p>");
            $(".titleinput").val('');
            $(".bodyinput").val('');
          });

      });
      $(document).on("click", "#noteDelete", function () {
        $(".note").empty();
        $('#noteModal').modal('toggle')
        $.ajax({
            method: "POST",
            url: "/noteDelete/" + thisId,
          }).catch(function (err) {
            console.log(err);
          });

      });

    });
});
$(document).on("click", "#dataDelete", function () {
  $("#Articles").empty();
  $.ajax({
      method: "POST",
      url: "/dataDelete"
    }).catch(function (err) {
      console.log(err);
    });

});