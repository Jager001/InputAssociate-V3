
$.lookupControl = $.lookupControl || {};

/**
 * 控制类，具体方法实现
 */
$.extend($.lookupControl, {
	
	// 全局配置属性
    lookupConfig: {},
    
    // 分页滚动对象
    lookupScroll: {},
	
	// 控件面板ID
	lookupIds: {
		lookupPanelId: "lookupPanelId",					// 面板ID
		lookupPanelHeaderId: "lookupPanelHeaderId",		// HeaderID
		lookupBackIconId: "lookupBackIconId",			// 返回按钮ID
		lookupSearchInputId: "lookupSearchInputId",		// 搜索框ID
		lookupSearchIconId: "lookupSearchIconId",		// 搜索按钮ID
		lookupScrollerWrapper: "lookupScrollerWrapper",	// 上拉下拉面板ID
		lookupListId: "lookupListId",					// 联想数据列表ID
		lookupScrollerPullUp: "lookupScrollerPullUp",	// 上拉加载更多DivID
		lookupHotHistoryDivId: "lookupHotHistoryDivId",	// 热门和历史DivID
		lookupHotDivId: "lookupHotDivId",				// 热门DivID
		lookupHistoryDivId: "lookupHistoryDivId",		// 历史DivID
		lookupHotListId: "lookupHotListId",				// 热门列表ID
		lookupHistoryListId: "lookupHistoryListId",		// 历史列表ID
		lookupHistoryCleanId: "lookupHistoryCleanId",	// 清空历史按钮ID
		// 控件搜索面板返回图标
    	lookupBackPath: MyApp.getAbsolutePath("images/core/img_ass_back.png"),
    	// 控件搜索面板搜索图标
    	lookupSearchPath: MyApp.getAbsolutePath("images/core/img_ass_search.png"),
    	// 历史列表删除图标
    	lookupHistoryDelPath: MyApp.getAbsolutePath("images/core/img_ass_delete.png"),
    	// 数据联想列表图标
    	lookupListIconPath: MyApp.getAbsolutePath("images/core/img_ass_item.png")
	},
    
    // 控件模板
    _template: {
    	panel: _.template(
    		'<style>.ui-panel-inner {padding:0px;}</style>'+
    		'<div id="<%= lookupPanelId %>" data-role="panel" style="display:none;width:<%= screenWidth %>px;" '+
		    		'data-swipe-close="false" data-dismissible="false" data-display="overlay" '+
		    		'data-position="<%= showStyle %>" data-position-fixed="true" data-theme="a">'+
		    		
	    		'<div id="<%= lookupPanelHeaderId %>">'+
		    		'<div style="background-color:<%= themeColor %>;width:100%;height:52px;position:fixed;z-index:99;">' +
						'<div style="padding:10px;height:32px;line-height:32px;">' +
							'<div id="<%= lookupBackIconId %>" style="float:left;width:10%;">' +
								'<div style="text-align:center"><img style="margin:auto" src="<%= lookupBackPath %>"></div>' +
							'</div>' +
							'<div style="float:left;padding-left:1%;width:79%;">' +
								'<input id="<%= lookupSearchInputId %>" type="text" placeholder="<%= placeHolder %>" '+
									'data-role="none" style="width:92%;height:28px;border:0px;padding:0 8px;">'+
							'</div>' +
							'<div id="<%= lookupSearchIconId %>" style="float:left;width:10%;">' +
								'<div style="text-align:center"><img style="margin:auto" src="<%= lookupSearchPath %>"></div>' +
							'</div>' +
						'</div>' +
					'</div>'+
	    		'</div>'+
	    		
	    		'<div id="<%= lookupScrollerWrapper %>">'+
		        	'<div>'+
						'<div><ul id="<%= lookupListId%>" data-role="listview"></ul></div>'+
			        	'<div id="<%= lookupScrollerPullUp %>" style="display:none"><span>上拉加载更多</span></div>'+
		        	'</div>'+
	        	'</div>'+
	        	
	        	'<div id="<%= lookupHotHistoryDivId %>" style="padding-top:54px;">'+
	        		'<div id="<%= lookupHotDivId %>"></div>'+
	        		'<div id="<%= lookupHistoryDivId %>"></div>'+
	        	'</div>'+
	        	
        	'</div>'
    	)
    },
    
    // 控件初始化
	init: function ($self, options) {
		
		var opt = $.extend({
	    	screenWidth: $(window).width(),			// 屏幕宽度
	    	screenHeight: $(window).height(),		// 屏幕高度
	    	placeHolder : '关键字..',				// 输入框提示文字
	    	themeColor : "#0A9EE5",					// 控件主题颜色
        	showStyle : "right",					// 控件的弹出方式
        	showHotSearch: "false",					// 默认不显示热门搜索
        	hotSearchMax: 10,						// 热门搜索最多个数，默认最多显示10个
        	showHistory: "true",					// 默认显示搜索历史
        	currentPage: 1							// 联想列表分页当前页,默认是1
        	
		}, $.extend(options, this.lookupIds));
		
		// 配置初始化
    	this._setConfig(opt);
		
        // 输入框添加清空按钮
    	if (typeof ($self.attr("data-clear-btn")) === "undefined" && !$self.textinput("option", "clearBtn")) {
    	    $self.textinput("option", "clearBtn", true);
    	}

        // 判断如果是动态绑定，需要加上data-myctl标记
    	if (typeof($self.attr("data-myctl")) === "undefined") {
    	    $self.attr("data-myctl", "lookup");
    	}
    		
        // 构建并初始化面板
    	if($("#"+this.lookupIds.lookupPanelId)) $("#"+this.lookupIds.lookupPanelId).remove();
    	
    	var pageId = MyApp.getCurrentPageId();
    	var lookupPanelHtml = this._template.panel(opt);
    	$("#" + pageId).append(lookupPanelHtml).trigger("create");
    	
    	// 绑定事件
    	this.bindSlideUp($self);
    	
    	var $this = this;
    	$("#"+this.lookupIds.lookupBackIconId).on("click", function(){
    		$this.closeLookupPanel($self);
    	});
    	$("#"+this.lookupIds.lookupSearchIconId).on("click", function(){
    		$this.associateByKey($self, 0);
    	});
    	$("#"+this.lookupIds.lookupSearchInputId).on("input propertychange", function() {
    		$this.inputKeyupFn($self);
    	});

        // 打开panel
    	$("#"+this.lookupIds.lookupPanelId).css("display", "");
    	$("#"+this.lookupIds.lookupPanelId).panel("open");
    	$("#"+this.lookupIds.lookupScrollerWrapper).css("display", "none");

		var storeKey = opt.lookupkey,
			inputId = $self.attr("id");
		
        // 加载热门搜索
	    $("#"+this.lookupIds.lookupHotDivId).html("").trigger("create");
	    if (opt.showHotSearch === "true") {
	        setTimeout(function() {
        		$this.getHotSearchData($self);
	        }, 300);
	    } else {
	        $("#"+this.lookupIds.lookupHotDivId).css("display", "none");
	    }

    	// 加载搜索历史
    	var storeArray = store.get(storeKey);
    	if (opt.showHistory = "true" && storeArray && storeArray.length > 0) {
    	    this.getHistoryData($self);
    	} else {
    	    $("#"+this.lookupIds.lookupHistoryDivId).css("display", "none");
    	}
	},
	
    // 获取控件配置属性
    _getConfig: function() {
        return this.lookupConfig;
    },

    // 设置控件配置属性
    _setConfig: function (config) {
        this.lookupConfig = config;
    },

    // 控件--绑定输入事件
    inputKeyupFn: function ($self) {

        var inputObj = $("#"+this.lookupIds.lookupSearchInputId);
        var config = this._getConfig();

        // 最后请求数据的时间
        var lastTime = inputObj.data("lastTime");
        var now = new Date().getTime();
        lastTime = lastTime ? lastTime : now;
        var time = lastTime + 600 - now;

        if (time <= 0) {
            // 超过最小间隔时间
            inputObj.data("lastTime", now);
            this.associateByKey($self, 0);

        } else {
            // 未超过最小间隔时间，就延迟请求
            var $this = this;
            setTimeout(function () {
                inputObj.data("lastTime", new Date().getTime());
                $this.associateByKey($self, 0);
            }, time);
        }

    },

    // 控件--给调用控件的输入框赋值
    setInputData: function ($self, keyValue, textValue) {

        var config = this._getConfig();

        // 设置控件的值
        Util.setMyCtlValue($self.attr("id"), keyValue, textValue);

        // 输入框聚焦
        $self.focus();

        // 关闭搜索面板
        this.closeLookupPanel();
    },

    // 控件--根据service名字获取service对象
    _getServiceByName: function (name) {
        var obj;
        for (var i = 0; i < Services.length; i++) {
            if (Services[i].name === name) {
                obj = Services[i];
                break;
            }
        }
        if (!Util.isNullObj(obj)) {
            return obj;
        } else {
            return DefaultService;
        }
    },

    // 热门面板--获取后台数据
    getHotSearchData: function ($self) {

        var config = this._getConfig();
        
        // 调用上行代理
        var queryInfo = $(this).postHotProxyData(config.lookupservice, config.lookupkey);

        var opt = new CInvokeOption('lookupHot', queryInfo);
        var serviceObj = this._getServiceByName(config.lookupservice);

		var $this = this;
        serviceObj.invoke(opt,
            function (rst) {
                // 调用下行代理
                var obj = $(this).loadHotProxyData(config.lookupservice, rst.data);
                
                var htmlStr = $this.buildHotSearchHtml($self, obj.data);
                var lookupHotDiv = $("#"+$this.lookupIds.lookupHotDivId);
                
                lookupHotDiv.html(htmlStr);
                
                // 绑定点击事件
                $("#"+$this.lookupIds.lookupHotListId+" a").each(function() {
                	
                	var v = $(this).attr("value");
                	var keyValue = v.substring(0, v.indexOf('-'));
                	var textValue = v.substring(v.indexOf('-')+1);
                	
                	$(this).on("click", function() {
                		$this.setInputData($self, keyValue, textValue);
                	});
                	
                });
                
                lookupHotDiv.css("display", "");
            },
            function (errObj) {
                //请求失败后的处理
            },
            function () {
                //请求前的处理
            },
            function () {
                //请求后的处理，不管成功还是失败都会执行
            });
    },

    // 热门面板--构建块html
    buildHotSearchHtml: function ($self, array) {

        var config = this._getConfig();

        var buff = [];
        buff.push("<div style='padding:15px 0 0 15px;'>热门</div>");
        buff.push("<div id='"+this.lookupIds.lookupHotListId+"' style='padding:15px 15px 0 15px;overflow:hidden'>");

        for (var i = 0; i < array.length && i < config.hotSearchMax; i++) {
            buff.push(
        		"<a value='"+array[i].id+"-"+array[i].name+"' style='height:24px;line-height:24px;"+
            	"display:block;float:left;padding:0 10px; margin: 0 8px 8px 0;background-color:#F2F2F2;"+
            	"color:" + config.themeColor + ";font-size:12px;white-space: nowrap;'>" + array[i].name + "</a>");
        }
        buff.push("</div>");
        return buff.join('');
    },

    // 搜索历史--获取本地缓存数据
    getHistoryData: function ($self) {

        var htmlStr = this.buildHistoryHtml($self);
        $("#"+this.lookupIds.lookupHistoryDivId).html(htmlStr).trigger("create");
        this.bindHistoryItem($self);
        
        var $this = this;
        $("#"+this.lookupIds.lookupHistoryCleanId).on("click", function() {
        	$this.cleanHistory($self);
        });
        
        $("#"+this.lookupIds.lookupHistoryListId).listview("refresh");
        $("#"+this.lookupIds.lookupHistoryDivId).css("display", "");
    },
    
    // 搜索历史绑定
    bindHistoryItem: function($self) {
    	
        var $this = this;
        $("#"+this.lookupIds.lookupHistoryListId+" li").each(function(){
        	
        	var str = $(this).attr("value");
        	
        	// 搜索历史项绑定事件
        	$($(this).children()[0]).on("click", function() {
        		$this.clickHistoryList($self, str);
        	});
        	// 删除图标绑定事件
        	$($(this).children()[1]).on("click", function() {
        		$this.deleteHistoryItem($self, str);
        	});
        });
    },

    // 搜索历史--构建块html
    buildHistoryHtml: function ($self) {

        var config = this._getConfig();

        var buff = [];
        buff.push("<div style='padding:15px 0 15px 15px;'>搜索历史</div>");
        buff.push("<ul id='"+this.lookupIds.lookupHistoryListId+"' data-role='listview'>");

        buff.push(this.buildHistoryListHtml($self));

        buff.push("</ul>");
        buff.push("<div style='text-align:center;padding:10px 0;'><a id='"+this.lookupIds.lookupHistoryCleanId+"' "+
        	"style='text-shadow:none;color:#fff;background-color:" + config.themeColor + "' "+
        	"class='ui-btn ui-mini ui-corner-all ui-btn-inline'>清除搜索历史</a></div>");

        return buff.join('');
    },

    // 搜索历史--构建数据列表
    buildHistoryListHtml: function ($self) {

        var config = this._getConfig();

        var buff = [];
        var storeArray = store.get(config.lookupkey);
        for (var i = 0; i < storeArray.length; i++) {
            buff.push
	        ("<li style='color:grey' value='" + storeArray[i] + "'>" +
	    	    "<div style='float:left;width:90%;'>" + storeArray[i] + "</div>" +
		        "<div style='float:right;'><img src='" + this.lookupIds.lookupHistoryDelPath + "' class='ui-li-icon' ></div>" +
	        "</li>");
        }
        return buff.join('');
    },

    // 搜索历史--点击搜索历史
    clickHistoryList: function ($self, str) {
    	
        $("#"+this.lookupIds.lookupSearchInputId).val(str);
        this.associateByKey($self, 0);
    },

    // 搜索历史--添加
    addSearchHistory: function ($self, str) {

        var config = this._getConfig();

        var oldArr = store.get(config.lookupkey);
        if (oldArr) {
            for (var i = 0; i < oldArr.length; i++) {
                if (oldArr[i] === str) {
                    oldArr.splice(i, 1); // 如果数据组存在该元素，则把该元素删除
                    break;
                }
            }
            oldArr.unshift(str); // 再添加到第一个位置
            store.set(config.lookupkey, oldArr);
        } else {
            var newArr = new Array();
            newArr.unshift(str);
            store.set(config.lookupkey, newArr);
        }
    },

    // 搜索历史--删除
    deleteSearchHistory: function ($self, str) {

        var config = this._getConfig();

        var oldArr = store.get(config.lookupkey);
        if (oldArr) {
            for (var i = 0; i < oldArr.length; i++) {
                if (oldArr[i] === str) {
                    oldArr.splice(i, 1); // 如果数据组存在该元素，则把该元素删除
                    break;
                }
            }
            store.set(config.lookupkey, oldArr);
        } else {
            return false;
        }
    },

    // 搜索历史--单项删除
    deleteHistoryItem: function ($self, str) {

        var config = this._getConfig();

        this.deleteSearchHistory($self, str);

		this.refreshHistoryDiv($self);

        if (store.get(config.lookupkey).length == 0) {
            $("#"+this.lookupIds.lookupHistoryDivId).css("display", "none");
        }
    },

    // 搜索历史--清空
    cleanHistory: function ($self) {

        var config = this._getConfig();

        store.remove(config.lookupkey);

        $("#"+this.lookupIds.lookupHistoryDivId).css("display", "none");
    },

    // 搜索历史--刷新
    refreshHistoryDiv: function ($self) {

        $("#"+this.lookupIds.lookupHistoryDivId).css("display", "");
        
        $("#"+this.lookupIds.lookupHistoryListId).html("");

        var lis = this.buildHistoryListHtml($self);
        $("#"+this.lookupIds.lookupHistoryListId).html(lis);
        this.bindHistoryItem($self);
        
        $("#"+this.lookupIds.lookupHistoryListId).listview("refresh");
    },

    // 数据联想--关键词查询--tag=0 输入查询或点击查询, tag=1 翻页查询
    associateByKey: function ($self, tag) {
    	
        var keyword = $("#"+this.lookupIds.lookupSearchInputId).val();
		
        if (keyword) {
            $("#"+this.lookupIds.lookupHotHistoryDivId).css("display", "none");
            $("#"+this.lookupIds.lookupScrollerWrapper).css("display", "");
            this.getLookupData($self, tag, keyword);
        } else {
            $("#"+this.lookupIds.lookupListId).html("");
            $("#"+this.lookupIds.lookupHotHistoryDivId).css("display", "");
            $("#"+this.lookupIds.lookupScrollerWrapper).css("display", "none");
        }
    },

    // 数据联想--获取后台数据
    getLookupData: function ($self, tag, keyword) {

        var config = this._getConfig();
        
        // 调用上行代理
        var queryInfo = $(this).postProxyData(config.lookupservice, config.lookupkey, keyword, config.currentPage);
        
        var opt = new CInvokeOption('lookup', queryInfo);
        
        var serviceObj = this._getServiceByName(config.lookupservice);

		var $this = this;
        serviceObj.invoke(opt,
            function (rst) {
                // 调用下行代理
                var obj = $(this).loadProxyData(config.lookupservice, rst.data);
                var htmlStr = $this.buildLookupListHtml($self, obj.data);
                
                // tag=0 输入查询或点击查询, tag=1 翻页查询
                if(typeof(tag)!="undefined" && tag == 0) {
                	
		    		// 分页从1重新开始
			        config.currentPage = 1;
			        $("#"+$this.lookupIds.lookupListId).html(htmlStr);
			        
		    	}else if(obj.hasMoreData) {
                	
			        config.currentPage = config.currentPage+1;
			        $("#"+$this.lookupIds.lookupListId).append(htmlStr);
                	
                } else {
                	MyApp.showFloatMsg("已是最后一页");
                }
                
                // li绑定事件
                $("#"+$this.lookupIds.lookupListId+" li").each(function(){
                	var v = $(this).attr("value");
                	var keyValue = v.substring(0, v.indexOf('-'));
                	var textValue = v.substring(v.indexOf('-')+1);
                	$(this).on("click", function() {
                		$this.clickLookupList($self, keyValue, textValue);
                	});
                });
                
                $this._setConfig(config);
                $("#"+$this.lookupIds.lookupListId).listview("refresh");
                
                $this.lookupScroll.refresh();
                $("#"+$this.lookupIds.lookupScrollerPullUp).css("display", "none");
                
            },
            function (errObj) {
                //请求失败后的处理
            },
            function () {
                //请求前的处理
            },
            function () {
                //请求后的处理，不管成功还是失败都会执行
            });
    },

    // 数据联想--构建联想html
    buildLookupListHtml: function ($self, array) {

        var buff = [];

        for (var i = 0; i < array.length; i++) {
            buff.push('<li value="'+array[i].id+'-'+array[i].name+'">'+
            	'<img src="' + this.lookupIds.lookupListIconPath + '" alt="" class="ui-li-icon">' + array[i].name + '</li>');
        }
        if (buff.length == 0) {
            buff.push('<li style="color:grey;">暂无搜索结果.</li>');
        }
        return buff.join('');
    },

	// 数据联想--绑定上拉刷新
	bindSlideUp: function($self) {
		
		this.lookupScroll = new IScroll('#'+this.lookupIds.lookupScrollerWrapper, 
			{ probeType: 3, mouseWheel: true, click: true });
		
		var $lookupScrollerWrapper = $("#"+this.lookupIds.lookupScrollerWrapper);
		var $lookupScrollerPullUp = $("#"+this.lookupIds.lookupScrollerPullUp);
		
		this.lookupScroll.on("scroll", function() {
			if(this.maxScrollY - this.y >= 40){
				$lookupScrollerPullUp.css("display", "");
			}
		});
		
		var $this = this;
		this.lookupScroll.on("slideUp", function() {
			if(this.maxScrollY - this.y >= 40) {
				this.scrollTo(0, this.maxScrollY-47, 3000, IScroll.utils.ease.back);
				$this.associateByKey($self);
			}
		});
		
		$lookupScrollerWrapper.on('touchmove', function(){
			var ls = $this.lookupScroll;
		 	if(ls.maxScrollY - ls.y >= 40){
		 		$lookupScrollerPullUp.html("释放加载更多");
			} 
		});
		
		$lookupScrollerWrapper.on('touchend', function(){
			var ls = $this.lookupScroll;
		 	if(ls.maxScrollY - ls.y >= 40){
		 		$lookupScrollerPullUp.html("正在加载...");
			} else {
				$lookupScrollerPullUp.html("上拉加载更多");
			}
		});
		
	},
	
    // 数据联想--点击联想列表
    clickLookupList: function ($self, keyValue, textValue) {
    	
        // 设置控件的值
        this.setInputData($self, keyValue, textValue);

        // 添加搜索历史
        this.addSearchHistory($self, $("#"+this.lookupIds.lookupSearchInputId).val());

        // 刷新搜索历史div
        this.refreshHistoryDiv();
    },

    // 数据联想--关闭联想面板
    closeLookupPanel: function ($self) {

	    $("#"+this.lookupIds.lookupListId).html("");
	    $("#"+this.lookupIds.lookupPanelId).panel("close");
	    $("#"+this.lookupIds.lookupHotHistoryDivId).css("display","");
    }
    
});

/**
 * 控件方法调用入口
 * @param {Object} options 参数
 */
$.fn.lookup = function(options) {
	
	if (typeof options == 'string') {
		
		var fn = $.lookupControl[options];
		
		if (!fn) {
			throw ("lookupControl - No such method: " + options);
		}
		
		var args = $.makeArray(arguments).slice(1);
		args.unshift($(this));
		
		return fn.apply($.lookupControl, args);
		
	}else{
		
		return this.each( function() {
			$(this).lookup('init',options);
		});
	}
};


