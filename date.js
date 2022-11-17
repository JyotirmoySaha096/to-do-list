
module.exports = getDate;

function getDate(){
    var today = new Date();
    var options={
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year:'numeric'
    }
    var currentDay = today.toLocaleDateString('en-US', options);
    return currentDay;  
}
