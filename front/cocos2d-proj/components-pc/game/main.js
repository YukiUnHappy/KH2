cc.game.onStart = function () {
  if (cc.sys.isNative === true) {
    jsb.fileUtils.addSearchPath(["res"]);
  }
  cc.view.enableRetina(false);
  cc.view.enableAutoFullScreen(false);
  cc.view.adjustViewPort(false);
  cc.view.resizeWithBrowserSize(false);
  var policy = new cc.ResolutionPolicy(cc.ContainerStrategy.EQUAL_TO_FRAME, cc.ContentStrategy.EXACT_FIT);
  cc.view.setDesignResolutionSize(
    cc.game.config.designWidth,
    cc.game.config.designHeight,
    policy
  );

  Q.all([
    kh.createInstance("playerGameConfig").init(),
    kh.loadResourceAsset
  ])
  .spread(function (playerConfig){

    cc.LoaderScene.preload(gResources, function () {
      var router = kh.createInstance("router");
      router.setCurrentComponent("mypage", location.hash);
    });

    var needLoad = playerConfig.isSoundOn() && playerConfig.isSeOn();
    if(!needLoad){
      return;
    }

    cc.loader.load(mp3Resources, function(error, loadedResources) {
      if (error != null) {
        global.console.error(error);
        return;
      }
      khutil.preloadSe(playerConfig);
      khutil.playBGM(playerConfig);
    });
  }).fail(function(err) { console.error(err); });

};
cc.game.run();
