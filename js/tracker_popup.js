(function($, _, window, document, undefined) {
    var POPUP;
    POPUP = {
        init: function() {
            this.onEvent();
        },
        sendLS: function(dataArr) {
            var _data = JSON.stringify(dataArr);
            chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                            from: "popup",
                            subject: "saveMemoList",
                            data: _data
                        }, function(response) {
                            response && alert(response);
                        }
                    );
                }
            );
        },
        makeList: function(strData) {
            if (typeof strData != "undefined") {
                var _html = '<li class="empty">No saved memo</li>';
                var _db = JSON.parse(strData);
                var memoColor = '#ff0000';
                if (_db.length) {
                    _html = "";
                    $.each(_db, function(index) {
                        memoColor = _db[index].uColor;  
                        if(memoColor == 'undefined' || typeof memoColor == "undefined") memoColor = '#ff0000';
                        _html += '<li class="user"><label>';
                        _html += '<input class="user-chk" type="checkbox" name="" data-nick="' + _db[index].uNick + '" data-id="' + _db[index].uID + '"/>';
                        _html += '<span class="user-nick" title="' + _db[index].uNick + '">' + _db[index].uNick + '</span>';
                        _html += '<input class="user-color color {hash:true,caps:false}" value="'+ memoColor +'" />';
                        _html += '<input type="text" class="user-memo" style="color:'+ memoColor +';" value="' + _db[index].uMemo + '" placeholder="메모"/> </label></li>';
                    });
                }
                $("#userList").html(_html);
                $(".color").on("change",function(){
                    $(this).siblings(".user-chk").prop("checked", true);
//                    $(this).siblings(".user-color").val($(this).val());
                });
                jscolor.init();
            }
        },
        onEvent: function() {
            $("#delete").off("click").on("click", function(e) {
                    var tmpArr = [];
                    var $listCheck = $("#userList").find('input[type="checkbox"]');
                    var $target = $listCheck.filter(":checked");
                    if (!$target.length) {
                        alert("Tick the checkboxes");
                        return;
                    }
                    $.each($target, function(idx) {
                            var $this = $(this);
                            tmpArr.push({
                                uID: $this.data("id"),
                                uNick: $this.data("nick"),
                                uMemo: $this.closest("li").find(".user-memo").val(),
                                uColor: $this.closest("li").find(".user-color").val()
                            });
                            $this.closest("li").remove();
                        }
                    );
                    POPUP.sendLS({
                        method: "erase",
                        data: tmpArr
                    });
                }
            );
            $("#modify").off("click").on("click", function(e) {
                    var tmpArr = [];
                    var $listCheck = $("#userList").find('input[type="checkbox"]');
                    var $target = $listCheck.filter(":checked");
                    if (!$target.length) {
                        alert("Please tick checkbox(es) first");
                        return;
                    }
                    $.each($target, function(idx) {
                            var $this = $(this);
                            tmpArr.push({
                                uID: $this.data("id"),
                                uNick: $this.data("nick"),
                                uMemo: $this.closest("li").find(".user-memo").val(),
                                uColor: $this.closest("li").find(".user-color").val()
                            });
                        }
                    );
                    POPUP.sendLS({
                        method: "modify",
                        data: tmpArr
                    });
                }
            );
            $("#chk-all").off("click").on("click", function() {
                    var $this = $(this);
                    var $listCheck = $("#userList").find('input[type="checkbox"]');
                    if ($this.data("check")) {
                        $listCheck.prop("checked", false);
                        $this.data("check", false);
                    } else {
                        $listCheck.prop("checked", true);
                        $this.data("check", true);
                    }
                }
            );
            $("#sync").off("click").on("click", function() {
                    POPUP.sendLS({
                        method: "sync"
                    });
                }
            );
            $("#syncGtoC").off("click").on("click", function() {
                    POPUP.sendLS({
                        method: "syncGtoC"
                    });
                }
            );
            $("#syncCtoG").off("click").on("click", function() {
                    POPUP.sendLS({
                        method: "syncCtoG"
                    });
                }
            );
        }
    };
    POPUP.init();
    chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                from: "popup",
                subject: "getMemolist"
            }, POPUP.makeList);
        }
    );

    chrome.tabs.getSelected(null , function(tab) {
            var tablink = tab.url;
            var notfreeboard = false;
            if (tablink.indexOf("ozbargain.com.au") == -1) {
                notfreeboard = true;
            }
            if (notfreeboard) {
                $("#head, #foot").hide();
                $("#userList").hide();
                $("#goFreeboard").show().on("click", function(){
                        chrome.tabs.update(tab.id, {
                            url: "https://www.ozbargain.com.au"
                        });
                        window.close();
                    }
                );
            }
        }
    );
}
)(jQuery, _, window, document);