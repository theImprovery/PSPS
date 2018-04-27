/**
 * Deals with displaying success/fail/info/blocking widgets to the user.
 *
 * Depends on UiUtils.js, Bootstrap 4
 */

var Informationals = (function(){
    var MESSAGE_TYPES = {
        YES_NO:"yesNoMessage",
        INFORMATION:"informational",
        BKG_PROCESS:"backgroundProcess"
    };

    function dismiss( emt ) {
        var $emt = $(emt);
        $emt.css({overflow:"hide"});
        $emt.animate({top: "-" + (0.3*emt.clientHeight) + "px",
                      height:"0px", marginTop:"0px", marginBottom:"0px",
                      opacity:"0"
            },500, "swing", function() { $emt.remove();} );
    }

    function initLoaderDialog() {
        var dialogHtml = "<div class=\"modal fade\" id=\"InformationalsLoaderModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n" +
            "<div class=\"modal-dialog\"><div class=\"modal-content\"><div class=\"text-center\">\n" +
            "<br /><i class=\"fa fa-cog fa-spin fa-5x\"></i><hr /><h5 id=\"InformationalsLoaderModalText\" class=\"text-center\">Loading</h5><br />\n" +
            "</div></div></div></div>\n" +
            "<div id=\"InformationalsMessageContainer\">\n" +
            "</div>";
        $("body").append(dialogHtml);
        $loaderElement = $("#InformationalsLoaderModal").modal({
            keyboard: false,
            backdrop:"static",
            show: false
        });
        $loaderElementText = $loaderElement.find("#InformationalsLoaderModalText");
    }

    function initInformationalsArea() {
        var area = UiUtils.makeDiv({id:"InformationalsMessageContainer"});
        area.id = "InformationalsMessageContainer";
        $("body").append(area);
        $informationalsArea = $(area);
    }

    var $loaderElement = null;
    var $loaderElementText = null;
    var $informationalsArea = null;
    var bkgArea = null;

    var makeYesNoMessage = function(type, title, message, callback, timeout ) {
      var ynm = makeInformational(type, title, message, timeout);
      ynm.callback = callback;
      ynm.messageType = MESSAGE_TYPES.YES_NO;
      return ynm;
    };

    var makeInformational =  function( type, title, message, timeout ) {
        var informational =  { title: title,
            type: type,
            message: message,
            messageType:MESSAGE_TYPES.INFORMATION
        };

        if ( timeout ) {
            var effTimeout = Number(timeout);
            if ( (! isNaN(effTimeout)) && effTimeout > 0 ) {
                informational.timeout = effTimeout;
            }
        }
        return informational;
    };

    var showInformational = function(informational) {
        var dismissButton = UiUtils.makeButton( function(){},
            {classes:["close"]},
            [UiUtils.fa("close")]
        );
        var elements = [dismissButton];
        if ( informational.title ) {
            elements.push(UiUtils.makeElement("strong",{}, informational.title));
            elements.push(" ");
        }
        if ( informational.message ) {
            elements.push( informational.message );
        }

        var info = UiUtils.makeElement("div", {classes:["alert","alert-"+informational.type]}, elements);

        $informationalsArea.append( info );

        dismissButton.onclick = function(){dismiss(info);};

        if ( informational.timeout ) {
            window.setTimeout( function(){ dismiss(info);}, informational.timeout );
        }

        return info;
    };

    var showYesNo = function(ynMsg) {

        var yesButton = UiUtils.makeButton( function(){},
            {classes:["btn", "btn-primary"]},
            ["Yes"]
        );
        var noButton = UiUtils.makeButton( function(){},
            {classes:["btn", "btn-default"]},
            ["No"]
        );
        var btnContainer = UiUtils.makeDiv("btnContainer", [noButton, yesButton]);

        var elements = [btnContainer];
        if ( ynMsg.title ) {
            elements.push(UiUtils.makeElement("strong",{}, ynMsg.title));
            elements.push(" ");
        }
        if ( ynMsg.message ) {
            elements.push( ynMsg.message );
        }

        var info = UiUtils.makeElement("div", {classes:["alert","alert-"+ynMsg.type, ynMsg.messageType]}, elements);
        $informationalsArea.append( info );

        info.dismiss = function() {
            dismiss(info);
        };
        var callbackInProgress = false;
        noButton.onclick = function(){ callbackInProgress=true; ynMsg.callback(false, info); };
        yesButton.onclick = function(){ callbackInProgress=true;  ynMsg.callback(true, info); };

        if ( ynMsg.timeout ) {
            var timeoutCallback = function(){
                if ( ! callbackInProgress ) {
                    ynMsg.callback(undefined, info);
            }};
            window.setTimeout( timeoutCallback, ynMsg.timeout );
        }

        return info;
    };

    function makeBackgroundProcessMessage( title ) {
        var elements = [
            UiUtils.makeElement("i", {classes:["fa","fa-spin","fa-cog"]}, ""),
            UiUtils.makeElement("i", {classes:["fa","fa-check-circle-o","text-hide"]}, ""),
            UiUtils.makeElement("p", {}, title)
        ];
        var info = UiUtils.makeElement("div", {classes:[MESSAGE_TYPES.BKG_PROCESS, "loading"]}, elements );
        info.dismiss = function(){ console.log("dismiss called"); dismiss(info); };
        info.success = function(){
          info.dismiss = function(){}; // no-op, so client code can't double-dismiss this.
          $(this).addClass("done");
          $(this).find("i.fa-spin").remove();
          $(this).find("i.text-hide").removeClass("text-hide");
          window.setTimeout(function(){ dismiss(info);}, 1500);
        };
        return info;
    }

    var loaderModalTransitioning = false;
    var loader = function( isShow, text ) {
        if ( ! $loaderElement ) {
            initLoaderDialog();
        }
        if ( loaderModalTransitioning ) {
            // loader is currently animating, wait 500 ms
            window.setTimeout(function(){loader(isShow, text);},500);
            return;
        }
        loaderModalTransitioning = true;

        if ( typeof isShow === 'string' ) {
            text = isShow;
            isShow = true;
        }
        if ( isShow ) {
            if ((typeof text !== 'undefined')) {
                $loaderElementText.text(text);
            } else {
                $loaderElementText.text("processing...");
            }
        }
        var takeFlagDown = function(){loaderModalTransitioning=false;};
        $loaderElement.modal( isShow ? "show":"hide" )
                      .on("hidden.bs.modal", takeFlagDown)
                      .on("shown.bs.modal", takeFlagDown);
    };

    return {
        loader: loader,
        make: makeInformational,
        makeInfo: function( title, message, timeout ) {
            return makeInformational("info", title, message, timeout);
        },
        makeWarning: function( title, message, timeout ) {
            return makeInformational("warning", title, message, timeout);
        },
        makeSuccess: function( title, message, timeout ) {
            return makeInformational("success", title, message, timeout);
        },
        makeDanger: function( title, message, timeout ) {
            return makeInformational("danger", title, message, timeout);
        },
        makeYesNo: function( type, title, message, callback, timeout ) {
            return makeYesNoMessage(type, title, message, callback, timeout );
        },

        show: function( informational ) {
            if ( ! $informationalsArea ) {
                initInformationalsArea();
            }
            if ( informational.messageType === MESSAGE_TYPES.INFORMATION ) {
               showInformational(informational);
            } else if ( informational.messageType === MESSAGE_TYPES.YES_NO ) {
               showYesNo( informational );
            } else {
               console.log("ERROR: Invalid informational message type: " + informational.messageType );
            }
        },
        showBackgroundProcess: function( title ) {
            var ldrMsg = makeBackgroundProcessMessage(title);
            if ( !bkgArea ) {
                bkgArea = UiUtils.makeElement("div", {id:"BackgroundProcessMessageContainer"}, []);
                $("body").append(bkgArea);
            }
            $(bkgArea).append(ldrMsg);
            return ldrMsg;
        },
        __loaderEmt:function(){return $loaderElement;}
    };
})();