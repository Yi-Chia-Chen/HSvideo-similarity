// ######## ##     ## ########  ########
// ##        ##   ##  ##     ##    ##
// ##         ## ##   ##     ##    ##
// ######      ###    ########     ##
// ##         ## ##   ##           ##
// ##        ##   ##  ##           ##
// ######## ##     ## ##           ##

// data saving
const FORMAL = false;
const EXPERIMENT_NAME = 'HSvideo';
const SUBJ_NUM_SCRIPT = 'php/subjNum.php';
const SAVING_SCRIPT = 'php/save.php';
const VISIT_FILE = 'visit_' + EXPERIMENT_NAME + '.txt';
const SUBJ_NUM_FILE = 'subjNum_' + EXPERIMENT_NAME + '.txt';
const TRIAL_FILE = "trial_" + EXPERIMENT_NAME + ".txt";
const ATTRITION_FILE = 'attrition_' + EXPERIMENT_NAME + '.txt';
const SUBJ_FILE = 'subj_' + EXPERIMENT_NAME + '.txt';
const SAVING_DIR_HOME = '/var/www-data-experiments/cvlstudy_data/YY/'+EXPERIMENT_NAME+'/';
const SAVING_DIR = FORMAL ? SAVING_DIR_HOME+'/formal' : SAVING_DIR_HOME+'/testing';
const ID_GET_VARIABLE_NAME = 'id';
const COMPLETION_URL = 'https://ycc.vision/'; //XXX: need to change to SONA (like this: https://ucla.sona-systems.com/webstudy_credit.aspx?experiment_id=2231&credit_token=4dbaa04987f7408abc9b916b7d99bb56&survey_code= )


// stimuli
const STIM_PATH = 'stim/';
const ALL_IMG_LIST = ['blank.png','maximize_window.png','no_music.png','ucla.png'];
const STIM_TYPE = '.mp4';
const INTERTRIAL_INTERVAL = 500; //ms
const STIM_SOURCE = 'stim/27movies/';
// const TRIAL_INPUT = {
//     0: [1,2,3],
//     1: [2,3,4],
//     2: [3,4,1],
// };
const TRIAL_INPUT = {
    0: ['1012_push', '4397_hug', '4408_lead'],
    1: ['5408_kiss', '5814_talk to', '5816_ignore'],
    2: ['5814_talk to', '5816_ignore', '4408_lead'],
    3: ['5814_talk to', '4408_lead', '5816_ignore'],
    4: ['5814_talk to', '5816_ignore', '4408_lead'],
    5: ['5814_talk to', '4408_lead', '5816_ignore']
};

const INSTR_PRAC_LIST = ['1012_push', '4397_hug', '4408_lead'];

// object variables
let subj, instr, test;

// criteria
const VIEWPORT_MIN_W = 800;
const VIEWPORT_MIN_H = 600;
const INSTR_READING_TIME_MIN = 0.3;

//  ######  #######    #    ######  #     #
//  #     # #         # #   #     #  #   #
//  #     # #        #   #  #     #   # #
//  ######  #####   #     # #     #    #
//  #   #   #       ####### #     #    #
//  #    #  #       #     # #     #    #
//  #     # ####### #     # ######     #

$(document).ready(function() {
    subj = new Subject(subj_options);
    subj.id = subj.getID(ID_GET_VARIABLE_NAME);
    subj.saveVisit();
    if (subj.phone) {
        halt_experiment('It seems that you are using a touchscreen device or a phone. Please use a laptop or desktop instead.<br /><br />If you believe you have received this message in error, please contact the experimenter at yiling.yun@g.ucla.edu<br /><br />Otherwise, please switch to a laptop or a desktop computer for this experiment.');
    } else if (subj.validID){
        load_img(0, STIM_PATH, ALL_IMG_LIST); //XXX: need to load videos too  YC: actually no need. We will buffer video for next trial each trial
        instr = new instrObject(instr_options);
        instr.start();
    }
});

function halt_experiment(explanation) {
    $('.pageBox').hide();
    $('#instrText').html(explanation);
    $('#instrNextBut').hide();
    $('#instrBox').show();
}

//   #####  #     # ######        # #######  #####  #######
//  #     # #     # #     #       # #       #     #    #
//  #       #     # #     #       # #       #          #
//   #####  #     # ######        # #####   #          #
//        # #     # #     # #     # #       #          #
//  #     # #     # #     # #     # #       #     #    #
//   #####   #####  ######   #####  #######  #####     #

const SUBJ_TITLES = [
    'num',
    'date',
    'startTime',
    'id',
    'userAgent',
    'endTime',
    'duration',
    'quizAttemptN',
    'instrReadingTimes',
    'quickReadingPageN',
    'hiddenCount',
    'hiddenDurations',
    'serious',
    'maximized',
    'problems',
    'gender',
    'age',
    'inView',
    'viewportW',
    'viewportH'
];

function update_task_object_subj_num() {
    if (typeof task !== 'undefined'){
        task.num = subj.num;
    }
}

function submit_debriefing_questions() {
    const OPEN_ENDED_ATTRIBUTE_NAMES = ['problems', 'age'];
    const CHOICE_ATTRIBUTE_NAMES = ['serious', 'maximized', 'gender'];
    const ALL_RESPONDED = show_hide_warnings(OPEN_ENDED_ATTRIBUTE_NAMES, CHOICE_ATTRIBUTE_NAMES);
    if (ALL_RESPONDED) {
        for (let a of OPEN_ENDED_ATTRIBUTE_NAMES) {
            subj[a] = subj[a].replace(/(?:\r\n|\r|\n)/g, '<br />');
        }
        subj.quizAttemptN = instr.quizAttemptN;
        subj.instrReadingTimes =
        (instr.readingTimes);
        subj.quickReadingPageN = Object.values(instr.readingTimes).filter(d => d < INSTR_READING_TIME_MIN).length;
        subj.submitAnswers();
        $('#questionsBox').hide();
        exit_fullscreen();
        allow_selection();
        $('#debriefingBox').show();
        $('body').scrollTop(0);
    }
}

function show_hide_warnings(open_ended_names, choice_names) {
    let all_responded = true;
    for (let q of open_ended_names) {
        subj[q] = $('#'+q).val();
        if(!check_if_responded([subj[q]], [])){
            $('#'+q+'-warning').show();
            all_responded = false;
            $('body').scrollTop(0);
        }else{
            $('#'+q+'-warning').hide();
        }
    }
    for (let q of choice_names) {
        subj[q] = $('input[name='+q+']:checked').val();
        if(!check_if_responded([], [subj[q]])){
            $('#'+q+'-warning').show();
            all_responded = false;
            $('body').scrollTop(0);
        }else{
            $('#'+q+'-warning').hide();
        }
    }
    return all_responded;
}

function allow_selection() {
    $('body').css({
        '-webkit-user-select':'text',
        '-moz-user-select':'text',
        '-ms-user-select':'text',
        'user-select':'text'
    });
}

function go_to_completion_page() {
    window.location.href = COMPLETION_URL+subj.id;
}

let subj_options = {
    titles: SUBJ_TITLES,
    viewportMinW: VIEWPORT_MIN_W,
    viewportMinH: VIEWPORT_MIN_H,
    subjNumCallback: update_task_object_subj_num,
    subjNumScript: SUBJ_NUM_SCRIPT,
    savingScript: SAVING_SCRIPT,
    subjNumFile: SUBJ_NUM_FILE,
    visitFile: VISIT_FILE,
    attritionFile: ATTRITION_FILE,
    subjFile: SUBJ_FILE,
    savingDir: SAVING_DIR
};

//  ### #     #  #####  ####### ######  #     #  #####  ####### ### ####### #     #  #####
//   #  ##    # #     #    #    #     # #     # #     #    #     #  #     # ##    # #     #
//   #  # #   # #          #    #     # #     # #          #     #  #     # # #   # #
//   #  #  #  #  #####     #    ######  #     # #          #     #  #     # #  #  #  #####
//   #  #   # #       #    #    #   #   #     # #          #     #  #     # #   # #       #
//   #  #    ## #     #    #    #    #  #     # #     #    #     #  #     # #    ## #     #
//  ### #     #  #####     #    #     #  #####   #####     #    ### ####### #     #  #####

var instr_text = new Array;
instr_text[0] = "<strong>Welcome!</strong><br /><br />I am a scientist researching human actions, and I am studying how people view other people's interactions.";
instr_text[1] = "Your contributions may help in designing robots and making animations in movies or video games!<br /><br />And, most importantly, I hope this is fun for you, too!";
instr_text[2] = "This experiment will take about 50 minutes to complete.<br /><br />Please help me by reading the instructions in the next few pages carefully, and avoid using the refresh or back buttons.";
instr_text[3] = "For this study to work, the webpage will automatically switch to the fullscreen view on the next page. Please stay in the fullscreen mode until the study automatically switches out from it.";
instr_text[4] = "Please also turn off any music you are playing. Music is known to affect my kind of studies and it will make your data unusable.";
instr_text[5] = "In this experiment, I will show you some simple animations of two triangles interacting with each other, just like the one in the example below.";
instr_text[6] = "Each time, three boxes containing three animations will show up. You may click to play each of them as many time as you like in whatever order you choose.";
instr_text[7] = "Your job is to pick the odd one out. That is to say, you should select the animation that looks the most different among the three.";
instr_text[8] = "You will make the selection by clicking on the button below the one you are choosing.";
instr_text[9] = "Note that you can only make your selection after you watch all three animations.";
instr_text[10] = "Let's try it once on the next page!";
instr_text[11] = "";
instr_text[12] = "I hope that was clear!<br /><br />By the way, you don't need to spend too much time thinking about what to choose. Just follow your intuitive impressions.";
instr_text[13] = "One last thing: Please make sure you make you choice based on the content of the animations and not the length or duration of them."
instr_text[14] = "The next page is a quick instruction quiz. (It's very simple!)";
instr_text[15] = "";
instr_text[16] = "Great! You can press SPACE to start. Please focus after you start. (Don't switch to other windows or tabs!)";

const INSTR_FUNC_DICT = {
    0: SHOW_INSTR,
    1: SHOW_INSTR,
    2: SHOW_INSTR,
    3: SHOW_MAXIMIZE_WINDOW,
    4: SHOW_NO_MUSIC,
    5: SHOW_EXAMPLE_ANIMATION,
    6: HIDE_EXAMPLE_ANIMATION,
    7: SHOW_INSTR,
    8: SHOW_INSTR,
    9: SHOW_INSTR,
    10: SHOW_INSTR,
    11: SHOW_PRACTICE,
    12: SHOW_INSTR,
    13: SHOW_INSTR,
    14: SHOW_INSTR,
    15: SHOW_INSTR_QUIZ,
    16: SHOW_CONSENT
};

function SHOW_INSTR(){
    $('#instrImg').css('display', 'none');
    $('#instrText').show();
    $('#instrNextBut').show();
}

function SHOW_INSTR_IMG(file_name) {
    $('#instrImg').attr('src', STIM_PATH + file_name);
    $('#instrImg').css('display', 'block');
}

function HIDE_INSTR_IMG() {
    $('#instrImg').css('display', 'none');
}

function SHOW_MAXIMIZE_WINDOW() {
    SHOW_INSTR_IMG('maximize_window.png');
}

function SHOW_NO_MUSIC() {
    enter_fullscreen();
    SHOW_INSTR_IMG('no_music.png');
}

function SHOW_EXAMPLE_ANIMATION() {
    HIDE_INSTR_IMG();
    $('#instrVid').css('display', 'block');
    $('#instrVid')[0].play();
}

function HIDE_EXAMPLE_ANIMATION() {
    $('#instrVid').hide();
}

function SHOW_PRACTICE() {
    $('#instrBox').hide();
    $('#vid1').attr('src', STIM_SOURCE + INSTR_PRAC_LIST[0] + STIM_TYPE);
    $('#vid2').attr('src', STIM_SOURCE + INSTR_PRAC_LIST[1] + STIM_TYPE);
    $('#vid3').attr('src', STIM_SOURCE + INSTR_PRAC_LIST[2] + STIM_TYPE);
    $('#vid1')[0].load();
    $('#vid2')[0].load();
    $('#vid3')[0].load();
    $('#stimuliBox .vid').on('ended', instr_practice_check_play_count);
    $('#stimuliBox .vid').on('mouseup', instr_practice_play);
    $('#taskBox').show();
    instr.vidPlayCounts = {
        'vid1': 0,
        'vid2': 0,
        'vid3': 0,
    }
    $('.responseBut').on('mouseup', BACK_TO_INSTRUCTIONS);
}

function instr_practice_play(ele) {
    $('.vid').off('mouseup');
    DISABLE_HOVER_EFFECT();
    $(".responseBut").hide();
    let target = $(ele.target).closest('.vid');
    target[0].play();
}

function instr_practice_check_play_count(ele) {
    $(ele.target)[0].currentTime = 0
    $(ele.target).css("border-color","#9D8F8F");
    ENABLE_HOVER_EFFECT();
    $('.vid').on('mouseup', instr_practice_play);
    instr.vidPlayCounts[$(ele.target).attr('id')] += 1;
    if (instr.vidPlayCounts['vid1'] > 0 && instr.vidPlayCounts['vid2'] > 0 && instr.vidPlayCounts['vid3'] > 0){
        $(".responseBut").show();
    }
}

function BACK_TO_INSTRUCTIONS() {
    $('#taskBox').hide();
    $('#stimuliBox .vid').off('ended');
    $('#stimuliBox .vid').off('mouseup');
    $('.responseBut').off('mouseup');
    $(".responseBut").hide();
    $("#stimuliBox .vid").css("border-color", "black");
    $('#instrBox').show();
    instr.next();
}

function SHOW_INSTR_QUIZ() {
    $('#instrBox').hide();
    $('#quizBox').show();
}

function SUBMIT_INSTR_QUIZ() {
    const CHOICE = $('input[name="quiz"]:checked').val();
    if (typeof CHOICE === 'undefined') {
        $('#quizWarning').text('Please answer the question. Thank you!');
    } else if (CHOICE != 'different') {
        instr.qAttemptN += 1;
        instr.saveReadingTime();
        $('#quizBox').hide();
        $('#instrText').text('You have given an incorrect answer. Please read the instructions again carefully.');
        $('#instrBox').show();
        instr.index = -1;
        $('input[name="quiz"]:checked').prop('checked', false);
    } else {
        instr.next();
        $('#quizBox').hide();
        $('#instrBox').show();
    }
}

function SHOW_CONSENT() {
    $('#instrNextBut').hide();
    $('#consentBox').show();
    $(document).keyup(function(e) {
        if (e.key == ' ') {
            $(document).off('keyup');
            instr.saveReadingTime();
            $('#instrBox').hide();
            subj.saveAttrition();
            show_trial();
        }
    });
}

var instr_options = {
    text: instr_text,
    funcDict: INSTR_FUNC_DICT,
};

//  ####### ######  ###    #    #
//     #    #     #  #    # #   #
//     #    #     #  #   #   #  #
//     #    ######   #  #     # #
//     #    #   #    #  ####### #
//     #    #    #   #  #     # #
//     #    #     # ### #     # #######
var trial_options = {
    subj: 'pre-define',
    titles: TRIAL_TITLES,
    dataFile: TRIAL_FILE,
    savingScript: SAVING_SCRIPT,
    savingDir: SAVING_DIR,
    stimSource: STIM_SOURCE,
    stimType: STIM_TYPE,
    trialInput: TRIAL_INPUT,
    intertrialInterval: INTERTRIAL_INTERVAL,
    //updateFunc: TRIAL_UPDATE,
    //trialFunc: TRIAL,
    endExptFunc: end_task
}

function show_trial() {
    trial_options['subj'] = subj;
    test = new trialObject(trial_options);
    $('#taskBox').show();
    subj.detectVisibilityStart();
    test.startTime = Date.now();
    test.init();
}

function end_task() {
    subj.detectVisibilityEnd();
    $('#taskBox').hide();
    $('#questionsBox').show();
    test.save();
}
