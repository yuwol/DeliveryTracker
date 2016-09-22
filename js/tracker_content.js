(function($, _, window, document, undefined) {
    var LS, MEMO, OPTIONS;
    LS = {
        set: function(shippingno) {
            var existNumber;
            var aNumber = [];
            var _savedData = LS._getParsedObj() || [];
            if (!_.isArray(shippingno)) {
                aNumber.push(shippingno);
            }else{
                aNumber = shippingno;
            }
            _.forEach(aNumber, function(_shippingno) {
                    existNumber = _.find(_savedData, function(shippingno) {
                            return shippingno.uID == _shippingno.uID;
                        }
                    );
                    if (existNumber) {
                        _savedData = _.reject(_savedData, existNumber);
                    }
                    _savedData.push(_shippingno);
                    LS._setStringfyObj(_savedData);
                }
            );
            location.reload();
        },        
        get: function(shippingNumber) {
            var resultObj;
            var _savedData = LS._getParsedObj() || [];
            if (shippingNumber) {
                resultObj = _.find(_savedData, function(shippingno) {
                        return shippingno.uID == shippingNumber;
                    }
                );
                return resultObj;
            } else {
                return _savedData;
            }
        },
        erase: function(shippingNumber) {
            var _tmpArr = [];
            var existNumber, _savedData = LS._getParsedObj() || [];
            if (!_.isArray(shippingNumber)) {
                _tmpArr.push(shippingNumber);
            } else {
                _tmpArr = shippingNumber;
            }
            _.forEach(_tmpArr, function(item) {
                    existNumber = _.find(_savedData, function(shippingno) {
                            return shippingno.uID == item;
                        }
                    );
                    if (existNumber) {
                        _savedData = _.reject(_savedData, existNumber);
                        LS._setStringfyObj(_savedData);
                    }
                }
            );
            location.reload();
        },
        sync: function() {
            var localTime = localStorage.getItem("__TRACKER_SYNCTIME") || "0";
            var google = {
                set: function(obj) {
                    chrome.storage.sync.set(obj);
                },
                get: function() {
                    chrome.storage.sync.get(null, function(res) {
                            if (!chrome.runtime.error) {
                                //console.dir( res );
                                var _memoArr = [];
                                for (var i = 0; i < 10; i++){
                                    _memoArr[i] = res['__DELIVERY_TRACKER_'+i];
                                }
                            }
                        }
                    );
                },
                sync : function(){
                    chrome.storage.sync.get(null, function(res) {
                            if (!chrome.runtime.error) {
                                if( res.__TRACKER_SYNCTIME ){
                                    timeDiff( res.__TRACKER_SYNCTIME );
                                } else {
                                    timeDiff(0);
                                }
                            }
                        }
                    );
                }
            };

            var timeDiff = function(googleTime) {
                if( !_.isNumber(googleTime) ){
                    googleTime = Number(googleTime);
                }
                var _arr = objectSliceToArray( LS.get() );
                var _memoObj = {};

                _memoObj['__TRACKER_SYNCTIME'] = localTime;
                _.forEach( _arr , function(n,key){
                    _memoObj['__DELIVERY_TRACKER_'+key] = n;
                });
//                    console.dir(_memoObj);
                google.get();
            };

            var objectSliceToArray = function( _jsonObj ){
                "use strict";
                var itemLen;
                var divideLen = 10;
                var resultArray = [];

                if( !_.isObject(_jsonObj) ){
                    return false;
                }

                _jsonObj = JSON.stringify(_jsonObj);
                itemLen = _jsonObj.length / divideLen;

                for (var i =0 ; i < divideLen ; i++ ){
                    resultArray[i] = _jsonObj.slice( i*itemLen, i*itemLen+itemLen );
                }

                return resultArray;
            };

            var arrayConvertToObject = function( _jsonArr ){
                "use strict";
                if( !_.isArray( _jsonArr ) ){
                    return false;
                }
                return ( JSON.parse(_jsonArr.join('')) );
            };
            google.sync();
        },        
        // Chrome to Google
        syncCtoG: function() {
            var localTime = localStorage.getItem("__TRACKER_SYNCTIME") || "0";
            var google = {
                set: function(obj) {
                    chrome.storage.sync.set(obj);
                },
                get: function() {
                    chrome.storage.sync.get(null, function(res) {
                            if (!chrome.runtime.error) {
                                //console.dir( res );
                                var _memoArr = [];

                                if( !_.isUndefined( res['__DELIVERY_TRACKER_0'] ) ){
                                    for (var i = 0; i < 10; i++){
                                        _memoArr[i] = res['__DELIVERY_TRACKER_'+i];
                                    }
                                    localStorage.setItem('__DELIVERY_TRACKER', _memoArr.join('') );
                                } else {
                                    localStorage.setItem('__DELIVERY_TRACKER', res['__DELIVERY_TRACKER'] );
                                }
                                localStorage.setItem('__TRACKER_SYNCTIME', JSON.parse(res.__TRACKER_SYNCTIME) );
                            }
                        }
                    );
                },
                sync : function(){
                    chrome.storage.sync.get(null, function(res) {
                            if (!chrome.runtime.error) {
                                if( res.__TRACKER_SYNCTIME ){
                                    timeDiff( res.__TRACKER_SYNCTIME );
                                } else {
                                    timeDiff(0);
                                }
                            }
                        }
                    );
                }
            };

            var timeDiff = function(googleTime) {
                if( !_.isNumber(googleTime) ){
                    googleTime = Number(googleTime);
                }

                if (confirm("Chrome -> Google.\n\nOverwrite note list on Google.\n\nKeep going?")) {
                    var _arr = objectSliceToArray( LS.get() );
                    var _memoObj = {};
                    _memoObj['__TRACKER_SYNCTIME'] = localTime;
                    _.forEach( _arr , function(n,key){
                        _memoObj['__DELIVERY_TRACKER_'+key] = n;
                    });
                    google.set( _memoObj );
                    alert("Chrome -> Google Success");
                }else{
                    return false;
                }
            };

            /**
             * object Slice To Array
             * @param _jsonObj {object}
             * @return {array}
             */
            var objectSliceToArray = function( _jsonObj ){
                "use strict";
                var itemLen;
                var divideLen = 10;
                var resultArray = [];
                if( !_.isObject(_jsonObj) ){
//                    alert('[error] jsonStrSlice :: 전달된 인자가 object가 아님');
                    return false;
                }
                _jsonObj = JSON.stringify(_jsonObj);
                itemLen = _jsonObj.length / divideLen;
                for (var i =0 ; i < divideLen ; i++ ){
                    resultArray[i] = _jsonObj.slice( i*itemLen, i*itemLen+itemLen );
                }
                return resultArray;
            };

            /**
             * Array Convert To Object
             * @param _jsonArr {array}
             * @returns JSON Object {object}
             */
            var arrayConvertToObject = function( _jsonArr ){
                "use strict";
                if( !_.isArray( _jsonArr ) ){
//                    alert('[error] jsonStrMerge :: 전달된 인자가 배열이 아님');
                    return false;
                }
                return ( JSON.parse(_jsonArr.join('')) );
            };
            google.sync();
        },

        // Google -> Chrome
        syncGtoC: function() {
            var localTime = localStorage.getItem("__TRACKER_SYNCTIME") || "0";
            var google = {
                set: function(obj) {
                    chrome.storage.sync.set(obj);
                },
                get: function() {
                    chrome.storage.sync.get(null, function(res) {
                            if (!chrome.runtime.error) {
                                console.dir( res );
                                var _memoArr = [];

                                if( !_.isUndefined( res['__DELIVERY_TRACKER_0'] ) ){
                                    for (var i = 0; i < 10; i++){
                                        _memoArr[i] = res['__DELIVERY_TRACKER_'+i];
                                    }
                                    localStorage.setItem('__DELIVERY_TRACKER', _memoArr.join('') );
//                                    console.log('new type of Google data');
//                                    console.dir( _memoArr.join('') );
                                } else {
//                                    console.log('old type of Google data');
//                                    console.dir( res['__DELIVERY_TRACKER'] );
                                    localStorage.setItem('__DELIVERY_TRACKER', res['__DELIVERY_TRACKER'] );
                                }
                                localStorage.setItem('__TRACKER_SYNCTIME', JSON.parse(res.__TRACKER_SYNCTIME) );

                            }
                        }
                    );
                },
                sync : function(){
                    chrome.storage.sync.get(null, function(res) {
                            if (!chrome.runtime.error) {
                                if( res.__TRACKER_SYNCTIME ){
                                    timeDiff( res.__TRACKER_SYNCTIME );
                                } else {
                                    timeDiff(0);
                                }
                            }
                        }
                    );
                }
            };

            var timeDiff = function(googleTime) {
                if( !_.isNumber(googleTime) ){
                    googleTime = Number(googleTime);
                }
                if (confirm("Google -> Chrome.\n\nOverwrite note list.\n\nKeep going?")) {
                    google.get();
                    alert("Google -> Chrome Success");
                }else{
                    return false;
                }
            };

            /**
             * object Slice To Array
             * @param _jsonObj {object}
             * @return {array}
             */
            var objectSliceToArray = function( _jsonObj ){
                "use strict";
                var itemLen;
                var divideLen = 10;
                var resultArray = [];

                if( !_.isObject(_jsonObj) ){
//                    alert('[error] jsonStrSlice :: 전달된 인자가 object가 아님');
                    return false;
                }

                _jsonObj = JSON.stringify(_jsonObj);
                itemLen = _jsonObj.length / divideLen;

                for (var i =0 ; i < divideLen ; i++ ){
                    resultArray[i] = _jsonObj.slice( i*itemLen, i*itemLen+itemLen );
                }
                return resultArray;
            };

            /**
             * Array Convert To Object
             * @param _jsonArr {array}
             * @returns JSON Object {object}
             */
            var arrayConvertToObject = function( _jsonArr ){
                "use strict";

                if( !_.isArray( _jsonArr ) ){
//                    alert('[error] jsonStrMerge :: 전달된 인자가 배열이 아님');
                    return false;
                }

                return ( JSON.parse(_jsonArr.join('')) );
            };

            google.sync();
        },

        _setStringfyObj: function(obj) {
            localStorage.setItem("__TRACKER_SYNCTIME", _.now());
            localStorage.setItem("__DELIVERY_TRACKER", JSON.stringify(obj));
        },
        _getParsedObj: function() {
            var _db = localStorage.getItem("__DELIVERY_TRACKER");

            if (!_db || _db.length == 9) {
                return false;                
            }
            if(_db.slice(-1) != "]") _db = _db+"]";
            return JSON.parse(_db);
        }
    }; // LS
    MEMO = {
        init: function(){
            var base = this;
            base.$user = $('#content a[href^="/user/"]');
            base.userIDs = (function() {
                var tmpArr = [];
                base.$user.each(function(index) {
                        var _class = $(this).attr('href');
                        tmpArr[index] = (function(){
                            if( _class.indexOf('/') != -1 ){
                                if(!isNaN(_class.split('/')[2])){
                                    return _class.split('/')[2];
                                }else{
                                    return _class;
                                }
                            } else {
                                return _class;
                            }
                        })();
                    }
                );
                return tmpArr;
            }
            )();
            base.printMemo();
            base.onEvent();
        },
        printMemo: function() {
            var base = this;
            var _db = LS.get()
                , _showUsers = base.userIDs;
            var tmpMemo = '';
            _.forEach( _showUsers, function( _uID, idx ) {
                var _storeUser = _.find(_db, function( u ){
                    return u.uID == _uID;
                });

                if (_storeUser) {
                    tmpMemo = _storeUser.uMemo;
                    if (tmpMemo.indexOf("blocked") > -1) { // 2015.11.16 v0.51
                        base.$user.eq(idx).closest(".comment-wrap").css('visibility','hidden');
                        base.$user.eq(idx).closest("li").hide();
                    }else if(_storeUser.uMemo == "favorite"){
                        base.$user.eq(idx).closest(".comment-wrap").addClass('ddanGay-love');
                        base.$user.eq(idx).closest("li").addClass('ddanGay-love');
                    }else{
                        base.$user.eq(idx).before('<span class="ddanGay-memo" style="color:'+_storeUser.uColor+'">[' + _storeUser.uMemo + "]</span>");
                    }
                }
            });
        },
        onEvent: function() {
            var base = this;
            base.$user.off("mousedown").on("mousedown", function(e) {
                    e.preventDefault();
                    var $this = $(this);
                    var _uNick = $this.text(),
                        _uID = (function(){
                            var _class = $this.attr("href");
                            if( _class.indexOf('/') != -1 ){
                                if(!isNaN(_class.split('/')[2])){
                                    return _class.split('/')[2];
                                }else{
                                    return _class;
                                }
                            } else {
                                return _class;
                            }
                        })(),
                        _uMemo;

                    if (e.which == 3) {
                        _uMemo = prompt("Please enter custom note for " + _uNick ) || "";
                        if (_uMemo.length && confirm("Do you want to set a custom note for "+_uNick+ " as [" + _uMemo + "]?")) {
                            LS.set({
                                uID: _uID,
                                uNick: _uNick,
                                uMemo: _uMemo
                            });
                        } else {
                            if (confirm("This custom note will be deleted due to empty input. \n\nDo you want to delete it?")) {
                                LS.erase(_uID);
                            }
                        }
                    }
                    return false;
                });


            var target = document.getElementById('cmtLoadingBox');
            if(target)
                observer.observe(target, { attributes : true, attributeFilter : ['style'] });
        }
    }; // MEMO
    OPTIONS = {
        init : function(){
            this.prevent();
        },
        prevent : function(){
            if ($('.content').length){
                if( localStorage.getItem('__DDANGAY_PREVENT_DETAIL') == 'true' ) {
                    $('.content').addClass('ddanGay_preventDetail').prepend('<a id="ddanGay_preventDetail_toggle" href="#" class="ddanGay_preventDetail_toggle">후방주의 임시해제</a>');
                }
            }
        }
    }; // OPTIONS   

    OPTIONS.init();
    MEMO.init();

    chrome.runtime.sendMessage({
        from: "content",
        subject: "makeMemoList"
    });

    chrome.runtime.onMessage.addListener(function(msg, sender, response){
            var _data;
            if ((msg.from === "popup") && (msg.subject === "saveMemoList")) {
                _data = JSON.parse(msg.data);
                if (_data.method == "sync") {
                    LS.sync();
                }else if(_data.method == "syncGtoC"){
                    LS.syncGtoC();                    
                    location.reload();
               }else if(_data.method == "syncCtoG"){
                    LS.syncCtoG();
                    location.reload();
             }
            }
            if ((msg.from === "popup") && (msg.subject === "getMemolist")) {
                response(JSON.stringify(LS.get()));
            }
            if ((msg.from === "popup") && (msg.subject === "preventDetail")) {
                response(JSON.stringify( localStorage.getItem('__DDANGAY_PREVENT_DETAIL') ));
            }
            if ((msg.from === "popup") && (msg.subject === "saveMemoList")) {
                _data = JSON.parse(msg.data);
                if (_data.method == "erase") {
                    LS.erase(_.pluck(_data.data, "uID"));
                    response("Deleted");
                } else {
                    if (_data.method == "modify") {
                        LS.set(_data.data);
                        response("Changed");
                    }
                }
            }
            if ((msg.from === "popup") && (msg.subject === "saveMemoList")) {
                _data = JSON.parse(msg.data);
                if (_data.method == "preventDetail") {
                    localStorage.setItem('__DDANGAY_PREVENT_DETAIL', _data.data );
                    location.reload();
                }
                if (_data.method == "autoDown") {
                    localStorage.setItem('__DDANGAY_AUTO_DOWN', _data.data );
                    location.reload();
                }
            }
        }
    ); // chrome.runtime
})(jQuery, _, window, document);