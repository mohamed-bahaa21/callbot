const audio = require('./audio');
var notifier = require('./notifier');

var not_interested_answers = ['not interested','no thank you', 'not today','nope', 'not interesting'];
var no_call_again_answers = ['not call again','stop', 'do not call me again','fuck off', 'fuck you'];
var yes_answers = ['yes','i do', 'yeah', 'okay', 'ok', 'that\'s fine','sure','that is fine','sir','i guess','show'];
var no_answers = ['no','nope', 'nah', 'now'];
var how_are_you_answers = ['how are you','is it going'];

var action;

function evaluateResponse(script_step, response){
    console.log('evaluateResponse', script_step, response);
    action = 'none';
    
    if (script_step == 1) {
        console.log('engine path 0');
        audio.playFiles(['./sounds/Intro.wav'],0);
    }
    //can you hear me ok?
    else if (script_step == 2){
        
        if (findMatch(response, no_call_again_answers)){
            console.log('engine path 1');
            audio.playFiles(['./sounds/Sorry to hear that.wav'],0);
            notifier.emit('end-call');
        }
        
        if (findMatch(response, not_interested_answers)){
            console.log('engine path 2');
            audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'],0);
            //notifier.emit('back-one-step');
        }
 
        else if (findMatch(response, how_are_you_answers)){
            console.log('engine path 3');
            audio.playFiles(['./sounds/Im fine.wav','./sounds/pitch_1.wav','./sounds/pitch_2.wav'],0);
        }
        else{
            console.log('engine path 4');
            audio.playFiles(['./sounds/pitch_1.wav','./sounds/pitch_2.wav'],0);
        }
    }
    //you may qualify ....
    else if (script_step == 3){
        
        if (findMatch(response, no_call_again_answers)){
            console.log('engine path 5');
            audio.playFiles(['./sounds/Sorry to hear that.wav'],0);
            notifier.emit('end-call');
        }
        
        if (findMatch(response, not_interested_answers)){
            console.log('engine path 6');
            audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'],0);
            notifier.emit('back-one-step');
        }
 
        else{
            console.log('engine path 7');
            audio.playFiles(['./sounds/opt.wav'],0);
        }
    }
    else if (script_step == 4){
        
        if (findMatch(response, no_call_again_answers)){
            console.log('engine path 8');
            audio.playFiles(['./sounds/Sorry to hear that.wav'],0);
            notifier.emit('end-call');
        }
        
        if (findMatch(response, not_interested_answers)){
            console.log('engine path 9');
            audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'],0);
            notifier.emit('back-one-step');
        }
 
        else if (findMatch(response, yes_answers)){
            console.log('engine path 10');
            audio.playFiles(['./sounds/PartA&B.wav'],0);
        }
    }
    //do you have part a and b
    else if (script_step == 5){
        
        if (findMatch(response, no_call_again_answers)){
            console.log('engine path 11');
            audio.playFiles(['./sounds/Sorry to hear that.wav'],0);
            notifier.emit('end-call');
        }
        
        if (findMatch(response, not_interested_answers)){
            console.log('engine path 12');
            audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'],0);
            notifier.emit('back-one-step');
        }
 
        else if (findMatch(response, yes_answers)){
            console.log('engine path 13');
            audio.playFiles(['./sounds/Goodtohear.wav','./sounds/age.wav'],0);
        }

        else if (findMatch(response, no_answers)){
            console.log('engine path 14');
            audio.playFiles(['./sounds/age.wav'],0);
        }

        else {
            console.log('engine path 14-5');
            audio.playFiles(['./sounds/saythatagain.wav'],0);
            action = 'back-one';
        }
    }
    //are you currently at least 64 years of age?
    else if (script_step == 6){
        
        if (findMatch(response, no_call_again_answers)){
            console.log('engine path 15');
            audio.playFiles(['./sounds/Sorry to hear that.wav'],0);
            notifier.emit('end-call');
        }
        
        if (findMatch(response, not_interested_answers)){
            console.log('engine path 16');
            audio.playFiles(['./sounds/Notinterested_1.wav', './sounds/Notinterested_2.wav'],0);
            notifier.emit('back-one-step');
        }
 
        else if (findMatch(response, yes_answers)){
            console.log('engine path 17');
            audio.playFiles(['./sounds/Transferconsent.wav'],0);
            notifier.emit('transfer-call');
        }

        /* goodbye ?
        else if (findMatch(response, no_answers)){
            console.log('engine path 18');
            audio.playFiles(['./sounds/age.wav'],0);
        }
        */
    }

}

function findMatch(response, group){
    var found_match = false;
    group.forEach(function(x){
        if (response.indexOf(x) > -1) found_match = true;
    });

    return found_match;
}

function getAction(){
    return action;
}

module.exports = {
    evaluateResponse: evaluateResponse,
    getAction: getAction
}