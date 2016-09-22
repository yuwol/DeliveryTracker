chrome.runtime.onMessage.addListener(function(msg, sender) {
    /* First, validate the message's structure */
    if ((msg.from === 'content') && (msg.subject === 'makeMemoList')) {
//        alert('content to popup');
    }
    if ((msg.from === 'popup') && (msg.subject === 'saveMemoList')) {
        //alert('popup to content');
    }
    if ((msg.from === 'popup') && (msg.subject === 'preventDetail')) {
        //alert('popup to content');
    }
});