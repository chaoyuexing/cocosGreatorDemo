var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: cc.Component,

    properties: {
        gameIdInput: cc.Node,
        appKeyInput: cc.Node,
        secret: cc.Node,
        alphaRadio: cc.Node,
        confirm: cc.Node,
        labelInfo: {
            default: null,
            type: cc.Label
        }        
    },

    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    },

    onLoad () {
        var self = this;
        this.alphaRadio.getComponent(cc.Toggle).isChecked = true;
        this.confirm.on(cc.Node.EventType.TOUCH_END, function(event){
            // 获取用户输入的参数
            GLB.gameId = Number(self.gameIdInput.getComponent(cc.EditBox).string);
            GLB.appKey = self.appKeyInput.getComponent(cc.EditBox).string;
            GLB.secret = self.secret.getComponent(cc.EditBox).string;
            var alpha = self.alphaRadio.getComponent(cc.Toggle).isChecked;
            if (alpha === true) {
                GLB.platform = 'alpha';
            } else {
                GLB.platform = 'release';
            }

            mvs.response.initResponse = self.initResponse.bind(self);

            // SDK初始化
            var result = mvs.engine.init(mvs.response, GLB.channel, GLB.platform, GLB.gameId);
            if (result !== 0) {
                return self.labelLog('初始化失败,错误码:' + result);
            }
        });
    },

    start () {

    },

    initResponse: function(status) {
        this.labelLog('初始化成功，开始注册用户');
        mvs.response.registerUserResponse = this.registerUserResponse.bind(this); // 用户注册之后的回调
        var result = mvs.engine.registerUser();
        if (result !== 0)
            return this.labelLog('注册用户失败，错误码:' + result);
        else
            this.labelLog('注册用户成功');
    },

    registerUserResponse: function (userInfo) {
        var deviceId = 'abcdef';
        var gatewayId = 0;
        GLB.userInfo = userInfo;

        this.labelLog('开始登录,用户Id:' + userInfo.id)

        mvs.response.loginResponse = this.loginResponse.bind(this); // 用户登录之后的回调
        var result = mvs.engine.login(userInfo.id, userInfo.token,
            GLB.gameId, GLB.gameVersion,
            GLB.appKey, GLB.secret,
            deviceId, gatewayId);

        if (result !== 0)
            return this.labelLog('登录失败,错误码:' + status);
    },

    loginResponse: function (info) {
        if (info.status !== 200)
            return this.labelLog('登录失败,异步回调错误码:' + info.status)
        else {
            this.labelLog('登录成功')
            cc.director.loadScene("lobby");
        }

        // this.labelLog('开始进入房间');
        // mvs.response.joinRoomResponse = this.joinRoomResponse.bind(this);
        // var result = mvs.engine.joinRandomRoom(GLB.MAX_PLAYER_COUNT, '')
        // if (result !== 0)
        //     return this.labelLog('进入房间失败,错误码:' + result)
    },

});
