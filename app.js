var firebaseConfig = {
    apiKey: "AIzaSyCCi7GfI3exDHC5UgFHxbRxF32vkBI4j9w",
    authDomain: "train-schedule-7ff9b.firebaseapp.com",
    databaseURL: "https://train-schedule-7ff9b.firebaseio.com",
    projectId: "train-schedule-7ff9b",
    storageBucket: "",
    messagingSenderId: "171691107404",
    appId: "1:171691107404:web:3855483f3b40c728bd80e9"
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var trainsRef = database.ref('/trains');
var child;
var pauseSetInterval = false;

$(document).ready(function () {
    updateSchedule();
});

$("#frequency").on("click", function (event) {
    event.preventDefault();
    if ($("#train-name-input").val() === "" || $("#destination-input").val() === "" || $("#first-train").val() === "" || $("#frequency-input").val() === "") {
        $("#required").text("Please fill out all the fields");
    } else {
        var trainName = $("#train-name-input").val().trim();
        var destination = $("#destination-input").val().trim();
        var firstTrain = $("#first-train").val().trim();
        var frequency = $("#frequency-input").val().trim();

        var newTrain = {
            trainName,
            destination,
            firstTrain,
            frequency
        };

        trainsRef.child(trainName).set(newTrain);

        $("#train-name-input").val("");
        $("#destination-input").val("");
        $("#first-train").val("");
        $("#frequency-input").val("");
        $("#required").text("");

        updateSchedule();
    }
});

function updateSchedule() {
    if (!pauseSetInterval) {
        $("tbody").empty();
        trainsRef.on('child_added', function (snapshot) {
            var frequency = snapshot.val().frequency;
            var firstTrain = snapshot.val().firstTrain;
            var trainName = snapshot.val().trainName;
            var destination = snapshot.val().destination;

            var result = calculations(firstTrain, frequency);

            var newRow = $("<tr>").append(
                $("<td>").text(trainName).addClass('trName canEdit'),
                $("<td>").text(destination).addClass('dest canEdit'),
                $("<td>").text(frequency).addClass('freq canEdit'),
                $("<td>").text(result[0]),
                $("<td>").text(result[1]),
            );

            $("#train-table > tbody").append(newRow);
            newRow.append(`<button class='btn btn-primary edit'>Edit</button>`);
            newRow.append(`<button class='btn btn-primary remove'>Remove</button>`);
        });
        console.log('updated');
    }
}

function calculations(firstTrainTime, freq) {
    var firstTrainConverted = moment(firstTrainTime, "HH:mm").subtract(1, "years");
    var diffTime = moment().diff(moment(firstTrainConverted), "minutes");
    var remainder = diffTime % freq;
    var minutesAway = freq - remainder;
    var nextTrain = moment().add(minutesAway, "minutes").format('LT');

    return [nextTrain, minutesAway];
}


$('tbody').on('click', '.edit', function () {
    var currentTD = $(this).parents('tr').find('.canEdit');
    if ($(this).html() == 'Edit') {
        $.each(currentTD, function () {
            $(this).prop('contenteditable', true)
        });
    } else {
        $.each(currentTD, function () {
            $(this).prop('contenteditable', false)
        });
    }
    child = $(this).parents('tr').find('.trName').html();
    $(this).removeClass('edit');
    $(this).addClass('save');
    $(this).html('Save');
    pauseSetInterval = true;
});

$('tbody').on('click', '.save', function () {
    var keyName = `${$(this).parents('tr').find('.trName').html()}`;
    trainsRef.child(`/${child}/`).update({ trainName: keyName });
    trainsRef.child(`/${child}/`).update({ destination: `${$(this).parents('tr').find('.dest').html()}` });
    trainsRef.child(`/${child}/`).update({ frequency: `${$(this).parents('tr').find('.freq').html()}` });
    updateSchedule();
    $(this).removeClass('save');
    $(this).addClass('edit');
    $(this).html('Edit');

    var trChild = trainsRef.child(`${child}`);
    trChild.once('value', function (snapshot) {
        trainsRef.child(`${keyName}`).set(snapshot.val());
        trChild.remove();
    });
    pauseSetInterval = false;
    updateSchedule();
});

$('tbody').on('click', '.remove', function () {
    var trName = $(this).parents('tr').find('.trName').html();
    trainsRef.child(trName).remove();
    updateSchedule();
});

setInterval(updateSchedule, 60000);


