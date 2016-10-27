
//Array for manipulation
var jsonArray = [];

//Global Variables :
var lanes_with_end_year = [];
var start_year = 0;
var end_year = 0;
var current_undo;

//Responsive to the heigth Resolution of the device.
var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
var scaling_factor = h/85;
scaling_factor = scaling_factor.toString() + "px";
document.body.style.fontSize = scaling_factor;


//Clear the screen before every draw().
function clearScreen() {

  var container = document.getElementById("container");
  var x_axis = document.getElementById("number-of-intervals");
  while(container.hasChildNodes()) {
    //  if(container.lastChild != x_axis){
        container.removeChild(container.lastChild);
      //}
  }
}



/*All Functions Related to X-Axis:
  The length is dynamically calculated based on the inputs given
  Infinity items span right to the end of the axis
  The main functions are listed below
*/

function getRange(jsonArray) {
  //Parse the Infinity factor
  start_year = 0;
  end_year = 0;
  parseInput(jsonArray);

  //Sorting of the inputs based on the birth year
  jsonArray.sort(function(a, b) {
      return a.birth - b.birth;
  });

  var start = jsonArray[0].birth;
  start_year = start;

  //Changing End year for Infinity
  changeEndYear(jsonArray);
  correctInput(jsonArray,end_year);

  var range = {
    "start" : start_year,
    "end" : end_year
  };

  return range;
}

//Change Infinity to 0
function parseInput(jsonArray) {
  jsonArray.forEach(function (one_event) {
      if(one_event.death == Infinity) {
        one_event.death = 0;
      }
  });
}

function changeEndYear(jsonArray) {
    jsonArray.forEach(function (one_event) {
        if(one_event.death > end_year) {
          end_year = one_event.death;
        }
    });
}


function correctInput(jsonArray,end) {
  jsonArray.forEach(function (one_event) {
      if(one_event.death == 0) {
        one_event.death = end;
      }
  });
}

// Drawing the Range
function drawRange(start,end) {
  var start = parseInt(start);
  var numberOfYears = end - start ;
  var scale = 10;
  var intervals = Math.round(numberOfYears / 10);

  var x_axis = document.createElement("ul");
  var grid = document.createElement("table");
  grid.setAttribute("id","grid");
  x_axis.setAttribute("id","x_axis");
  x_axis.setAttribute("number-of-intervals",intervals);
  var container = document.getElementById("container");
  container.appendChild(x_axis);
  container.appendChild(grid);

  $(function() {
    // Build "dynamic" rulers by adding items
    $("#x_axis[number-of-intervals]").each(function() {
        var x_axis = $(this).empty(),
            len = Number(x_axis.attr("number-of-intervals")) || 0,
            item = $(document.createElement("li")),
            tablecolumn = $(document.createElement("th")),
            i;
        for (i = 0; i <= len; i++) {
            x_axis.append(item.clone().text(start));
            $('#grid').append($('<th />', {text : ''}));
            start = start + scale;

        }
    });
    // Change the spacing programatically
    function changeRangeSpacing(spacing) {
       $("#x_axis").
         css("padding-right", spacing).
         find("li").
         css("padding-left", spacing);
   }
   $("#spacing").change(function() {
       changeRangeSpacing($(this).val());
   });
  });

  var grid = document.getElementById("grid");
  grid.style.width = document.getElementById("x_axis").width;
}



/*All Functions Related to One Event:
  1. The lane of the event is calcuated
  2. A new lane is created or a possible lane is given
  3. The position is decided based on the birth and death
  4. Width is calculated
  5.The Time Sheet is drawn
*/

//Calculate the Lane for the event (return new lane if not possible)
function calculateLane(newEvent) {
    if(lanes_with_end_year.length == 0 ) {
      lanes_with_end_year.push(newEvent.death);
      return 1;
    }
    var br = false;
    for(i = 0; i < lanes_with_end_year.length; i++) {
      if(lanes_with_end_year[i] < newEvent.birth) {
          lanes_with_end_year[i] = newEvent.death;
          br = true;
          break;
      }
    }

    if(!br) {
        lanes_with_end_year.push(newEvent.death);
        return lanes_with_end_year.length;
    } else {
        return i+1;
    }
}

//Create a new lane for adding a new event.
function createLane(lane) {
  var container = document.getElementById("container");
  var id = "lane" +lane;
  var lane_ul = document.createElement("ul");
  lane_ul.setAttribute("id",id);
  lane_ul.className = "one-event-lane";
  container.appendChild(lane_ul);
  return lane_ul;
}

//Get existing lane if lane available for new event
function getExistingLane(lane) {
  var id = "lane" +lane;
  var lane_ul =  document.getElementById(id);

  return lane_ul;
}


//Create Event for insertion
function createEvent(one_event, lane_to_add_event, lane) {
  var element =  document.createElement("li");
  var text_label = document.createTextNode(one_event.name);
  var div = document.createElement("div");
  var scan_summary = document.createElement("scan");
  scan_summary.setAttribute("class","summary");
  var summary = document.createTextNode(one_event.summary);

  scan_summary.appendChild(summary);

  div.setAttribute("class","label");
  div.appendChild(text_label);
  element.className = "one-event-lane-li";
  element.style.width = getEventrange(one_event);
  element.style.marginLeft = getEventOffset(one_event);
  element.style.bottom = getEventBottom(one_event,lane);
  element.appendChild(div);
  element.appendChild(scan_summary);
  lane_to_add_event.appendChild(element);

  // For display of the summary on mouseover
  div.addEventListener("mouseover",function(){
    scan_summary.style.display = "block";
  });

  div.addEventListener("mouseout",function(){
    scan_summary.style.display = "none";
  });

  element.addEventListener("dblclick", function(){
    var name = one_event.name;
    current_undo = one_event;
    $.each(jsonArray_original, function(i, el){
      if (this.name == name){
          jsonArray_original.splice(i, 1);
      }
    });

    draw(jsonArray_original);
  });
}

//Push Event in Correct Lane based on the Event Height
function getEventBottom(one_event, lane){
  var bottom = 2.5 + (2.5*lane);
  bottom = bottom.toString() + "em";
  return bottom;
}

//Push Event after the correct offset in that perticular lane
function getEventOffset(one_event){
  var offset = 6 + ((one_event.birth - start_year)* 0.6);
  offset = offset.toString() + "em";
  return offset;
}

//Get the width of the range.
function getEventrange(one_event) {
  var birth = one_event.birth;
  var death = one_event.death;
  var eventWidth = (death - birth) * 0.6;
  var eventWidth = eventWidth.toString() +"em";
  return eventWidth;
}

// Draw all the events
function drawAllEvents(jsonArray) {
  lanes_with_end_year = [];
  var i = 0;
  jsonArray.forEach( function (arrayItem){
    var current_lane = lanes_with_end_year.length;
    var lane = calculateLane(arrayItem);

    //Calculate if Lane is available...if Not Create a new one
    if(lane > current_lane) {
      var lane_to_add_event = createLane(lane);
    }
    var lane_to_add_event = getExistingLane(lane);

    createEvent(arrayItem, lane_to_add_event,lane);
  });
}


/* Adding Events to the Database and then updating the TimeSheet with the added Events*/

//Undo Event on Double Click
  var undo = document.getElementById("delete-undo")
  undo.addEventListener("click", function(){
  //Push New Value in our original Dataset
  if (current_undo != undefined) {
      jsonArray_original.push(current_undo);
      //Redraw the TimeSheet
      draw(jsonArray_original);
  }

});

//Event Listener for Click event on Add Button
document.getElementById("add-button").addEventListener("click", function(event) {
    var form = document.getElementById("add-new-element");
    form.style.display = "block";
    document.getElementById("container").style.filter ="blur(3px)";
});

//Event Listener for Click event on Cancel Button
function cancel(){
    var form = document.getElementById("add-new-element");
    form.style.display = "none";
    form.reset();
    document.getElementById("container").style.filter ="blur(0px)";
}


//Event Listener for Submitted Form
document.getElementById("add-new-element").addEventListener("submit", function(event){
    event.preventDefault();

    var form = document.getElementById("add-new-element");
    var name = document.getElementById("name").value;
    var birth = document.getElementById("birth").value;
    var death = document.getElementById("death").value;
    var summary = document.getElementById("summary").value;

    if (name.length == 0 || birth.length == 0 || death.length == 0 || summary.length == 0) {
      alert("Please complete all details again! ");
      //form.style.display = "none";
      form.reset();
    } else {
      var newEvent = {
        "name" : name,
        "birth" : birth,
        "death" : death,
        "summary" : summary,
      }
      //Push New Value in our original Dataset
      jsonArray_original.push(newEvent);

      //Redraw the TimeSheet
      draw(jsonArray_original);

      //Reset Form and hide it
      document.getElementById("container").style.filter ="blur(0px)";
      form.reset();
      form.style.display = "none";
    }
});


/*The Main DRAW FUNCTION*/
//Main Draw function
function draw(jsonArray_original) {
  clearScreen();
  //Get in data from original database
  jsonArray = $.map(jsonArray_original, function (obj) {
                      return $.extend(true, {}, obj);
                  });

  //Get the Range for the X-axis
  var range = getRange(jsonArray);
  //Draw the X-axis
  drawRange(range.start,range.end);
  //Draw all events
  drawAllEvents(jsonArray);
}


//Implmenetation Call for Drawing the TimeSheet
$(document).ready(function(){
  var container = document.getElementById('container');
  draw(jsonArray_original);
});

/* EXTRAS ********************



function swapFirstandLast(array){
  var temp = array[0];
  array[0] = array[array.length-1];
  array[array.length-1] = temp;

  return array;
}
*/



/*
//For changing lanes
function changeLane(current_lane) {
  var id = current_lane.getAttribute('id');
  var lane = current_lane.style.bottom;
  //document.getElementById(id).style.bottom = ""

}
*/
