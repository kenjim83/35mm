// Requires jQuery + lodash + mustache

var PLACEHOLDER_DIV_ID = "root";
var THEATERS_ENDPOINT = "http://35mmforever.com/api/get_posts/?post_type=theater";

var app = {};

app.render = function(html){
  $("#"+PLACEHOLDER_DIV_ID).html(html);
};

app.simplifyTheaters = function(theaters){
  return theaters.map(function(thr){
    return {
      title:   _.get(thr, "title"),
      city:    _.get(thr, "custom_fields.wpcf-city[0]"),
      state:   _.get(thr, "custom_fields.wpcf-state[0]"),
      image:   _.get(thr, "thumbnail_images.medium.url"),
      url:     _.get(thr, "url")
    };
  });
}


app.processResponse = function(resp){
  var theatersByState = [];
  var theaters = this.simplifyTheaters(resp.posts);
  var groupedByState = _.groupBy(theaters, function(thr){
    // attempt to transform state abbr to full name
    if(thr.state in app.ABBR_MAP){
      thr.state = app.ABBR_MAP[thr.state];
    }
    return thr.state;
  })
  // Remove any theaters missing state info
  delete groupedByState["undefined"];

  var statesAlphabetized = Object.keys(groupedByState).sort();
  var theatersByState = statesAlphabetized.map(function(state){
    return { state: state, theaters: groupedByState[state] };
  })
  this.renderTheaters(theatersByState);
};

app.renderTheaters = function(theatersByState){
  var html = "<section class='theater-feed'>";
  theatersByState.forEach(function(stateData){
    var stateTmpl = $("#stateTmpl").html();
    Mustache.parse(stateTmpl);
    html += Mustache.render(stateTmpl, stateData);
  });
  html += "</section>";
  this.render(html);
}

app.ABBR_MAP = {'AZ':'Arizona',
'AL':'Alabama',
'AK':'Alaska',
'AZ':'Arizona',
'AR':'Arkansas',
'CA':'California',
'CO':'Colorado',
'CT':'Connecticut',
'DE':'Delaware',
'FL':'Florida',
'GA':'Georgia',
'HI':'Hawaii',
'ID':'Idaho',
'IL':'Illinois',
'IN':'Indiana',
'IA':'Iowa',
'KS':'Kansas',
'KY':'Kentucky',
'KY':'Kentucky',
'LA':'Louisiana',
'ME':'Maine',
'MD':'Maryland',
'MA':'Massachusetts',
'MI':'Michigan',
'MN':'Minnesota',
'MS':'Mississippi',
'MO':'Missouri',
'MT':'Montana',
'NE':'Nebraska',
'NV':'Nevada',
'NH':'New Hampshire',
'NJ':'New Jersey',
'NM':'New Mexico',
'NY':'New York',
'NC':'North Carolina',
'ND':'North Dakota',
'OH':'Ohio',
'OK':'Oklahoma',
'OR':'Oregon',
'PA':'Pennsylvania',
'RI':'Rhode Island',
'SC':'South Carolina',
'SD':'South Dakota',
'TN':'Tennessee',
'TX':'Texas',
'UT':'Utah',
'VT':'Vermont',
'VA':'Virginia',
'WA':'Washington',
'WV':'West Virginia',
'WI':'Wisconsin',
'WY':'Wyoming'};

$( document ).ready(function() {
    $.get(THEATERS_ENDPOINT)
    .then(function(response){
      if(response.status === "ok"){
        app.processResponse(response);
      } else {
        app.render("We're experiencing some difficulties... Please try again :)")
      }
    })
});
