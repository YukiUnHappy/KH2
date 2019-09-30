/*
 * キーボードとマウス操作を支援するプラグインです.
 * キーボード:
 *     [ENTER]や[SPACE]で、次のメッセージへ.
 *     [ESC]でメッセージウィンドウを消す.
 * マウス:
 *     マウスの右クリックでメニューを表示.
 *     ※メニューが非表示の場合、メッセージウィンドウを消します.
 *
 * This is a plugin to support the operation of keyboard and mouse.
 * Keyboard:
 *     Press [Enter] or the space key to go to the next message.
 *     Press [Ecs] to hide the message window.
 * Mouse:
 *     Right-clicking displays the menu.
 *     Note: When the menu is not displayed, hide the message window.
 */
tyrano.plugin.kag.key_mouse = {
    kag : null,
    init : function() {
        var that = this;
        $(document).keyup(function(e) {
            switch (e.keyCode) {
            case 13:
            case 32:
                if (that.kag.key_mouse.canClick()) {
                    $(".layer_event_click").click();
                }
                break;
            case 27:
                that.kag.key_mouse.hideMessage();
                break;
            }
        });
        $(document).on("mousedown", function(e) {
            if (e.which == 3) {
                if ($('.button_menu').is(':visible')) {
                    that.kag.key_mouse.showMenu();
                } else {
                    that.kag.key_mouse.hideMessage();
                }
            }
        });
        $(document).on("contextmenu", function(e) {
            return false;
        });
    },
    canClick : function() {
        if ($(".layer_event_click").css("display") != "none") {
            return true;
        }
        return false;
    },
    canShowMenu : function() {
        if ($(".layer_free").css("display") == "none") {
            return true;
        }
        return false;
    },
    showMenu : function() {
        if (this.canShowMenu()) {
            if ($(".menu_close").size() > 0 && $(".layer_menu").css("display") != "none") {
                $(".menu_close").click();
            } else {
                $(".button_menu").click();
            }
        }
    },
    hideMessage : function() {
        if (this.canShowMenu()) {
            if ($(".menu_close").size() > 0 && $(".layer_menu").css("display") != "none") {
                $(".menu_close").click();
            } else {
                if (!this.kag.stat.is_strong_stop) {
                    if (this.kag.stat.is_hide_message) {
                        this.kag.layer.showMessageLayers();
                    } else {
                        this.kag.ftag.startTag("hidemessage");
                    }
                }
            }
        }
    }
};
