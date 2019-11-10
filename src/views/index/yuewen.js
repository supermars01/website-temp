/**
 * yuewen.js
 * @description 阅文官网一些交互脚本
 * @suthor zhangxinxu
 * @createtime 2016-05-17
 * @version 1.0
 */

export const YUEWEN = (function (doc, win, undefined) {
	// 状态类名常量
	var ACTIVE = 'active',
		REVERSE = 'reverse';

	var exports = {
		el: {},
		/**
			加载JS资源
		 * @param url {String} 加载的JS地址
		 * @param callback {Function} JS load完成后的回调
		*/
		load: function (url, callback) {
			var self = this;

			callback = callback || function () {};

			var eleScript = document.createElement('script');

			eleScript.onload = function () {
				if (!eleScript.isInited) {
					eleScript.isInited = true;
					callback.call(self);
				}
			};
			// 一般而言，低版本IE走这个
			eleScript.onreadystatechange = function () {
				if (!eleScript.isInited && /^loaded|complete$/.test(eleScript.readyState)) {
					eleScript.isInited = true;
					callback.call(self);
				}
			};

			eleScript.src = url;

			doc.getElementsByTagName('head')[0].appendChild(eleScript);
		},

		/**
		  图片等懒加载
		* @param images {Object} 图片们，包装器对象
		* @return 当前单例对象
		*/
		scrollLoading: function (images) {
			var cache = [],
				container = this.el.container;
			if (images && images.length) {
				images.each(function () {
					cache.push({
						obj: this,
						src: $(this).attr('data-src')
					});
				});

				var maxLength = images.length;

				var loading = function () {
					if (maxLength == 0) {
						container.off('scroll.loading');
						container.off('resize.loading');
						return;
					}
					var winHeight = $(win).height(),
						winWidth = $(win).width();

					$.each(cache, function (index, data) {
						var ele = data.obj;
						if (!ele) {
							return;
						}

						var rect = ele.getBoundingClientRect();
						if (rect.left == 0 && rect.top == 0) {
							// 认为元素是隐藏的
							return;
						}

						// 是否在页面屏幕内的判断
						var width = ele.clientWidth,
							height = ele.clientHeight;
						// 垂直方向
						var isVerticalIn = false;
						if ((rect.top + height) >= 0 && rect.top < winHeight) {
							isVerticalIn = true;
						}

						// 水平方向
						// var isHorizonalIn = false;
						// if ((rect.left + width) >=0 && rect.left < winWidth) {
						// 	isHorizonalIn = true;
						// }
						var isHorizonalIn = true;

						if (isVerticalIn && isHorizonalIn) {
							// 认为是在页面屏幕中
							ele.src = data.src;
							ele.removeAttribute('data-src');
							// 此元素不在参与加载处理
							data.obj = null;

							maxLength--;
						}
					});
				};

				container.on('scroll.loading', loading);
				container.on('resize.loading', loading);

				// 初始化就先来一遍
				loading();
			}
		},

		/**
		  主页顶部的背景图和文字的切换
		* @param el {String|Object} 元素，指当前需要应用swipe事件的对象
		* @param type {String} 'left'/'right'指方向
		* @param callback {Function} 触发的方法
		* @return 当前单例对象
		*/
		swipe: function (el, type, callback) {
			var self = this;

			if ($.isFunction(callback) == false) {
				return self;
			}

			// 移动端swipeLeft或swipeRight切换
			var start = {
					x: 0,
					y: 0
				},
				delta = {};

			// 事件们的处理
			var events = {
				start: function (event) {
					var touches = event.touches[0];

					// 起始坐标以及时间戳
					start = {
						x: touches.pageX,
						y: touches.pageY,

						time: +new Date
					};
				},
				move: function (event) {
					// 避免双指操作
					if (event.touches.length > 1 || event.scale && event.scale !== 1) {
						return;
					}

					// event.preventDefault();

					var touches = event.touches[0];

					delta = {
						x: touches.pageX - start.x,
						y: touches.pageY - start.y
					}
				},
				end: function (event) {
					// 时间
					var duration = +new Date - start.time;

					// 是否是有效的 next/prev/up/down slide
					// 小于500毫秒
					var isValidSlide = Number(duration) < 500;

					if (isValidSlide) {
						var deltaX = Math.abs(delta.x),
							deltaY = Math.abs(delta.y);

						if (deltaX > 20 && deltaY < deltaX) {
							if ((delta.x < 0 && type == 'left') || (delta.x > 0 && type == 'right')) {
								// 左滑动
								callback.call(el[0], events);
							}
						}
						if (deltaY > 20 && deltaX < deltaY) {
							if ((delta.y < 0 && type == 'top') || (delta.y > 0 && type == 'bottom')) {
								// 左滑动
								callback.call(el[0], events);
							}
						}
					}

					// 坐标位置还原
					start = {};
					delta = {};
				}
			};

			el.on("touchstart", events.start);
			el.on("touchmove", events.move);
			el.on("touchend", events.end);

			return self;
		},

		/**
		  主页顶部的背景图和文字的切换
		* @param buttons {String|Object} 可以是字符串，表示点击按钮的选择器们；也可以直接是jQuery或Zepto的包装器对象
		* @param callback {Function} 切换完成后的回调
		* @return 当前单例对象
		*/
		slide: function (buttons, callback) {
			var self = this;
			if (typeof buttons == 'string') {
				// buttons作为选择器处理
				buttons = $(buttons);
			}

			if (buttons && buttons.length) {
				var current = 0;
				var targets = $.map(buttons, function (button, index) {
					var hash = '';

					button = $(button);

					if (button.hasClass(ACTIVE)) {
						current = index;
					} else if ((hash = button.attr('data-hash')) && location.hash.replace('#', '') == hash) {
						current = index;
					}
					return $('#' + button.data('index', index).attr('data-rel'));
				});

				buttons.eq(current).addClass(ACTIVE);


				buttons.on('click', function () {
					var button = $(this),
						index = +button.data('index');

					if (button.hasClass(ACTIVE) == false) {
						_slide(index);
					}
				});

				var _slide = function (index) {
					buttons.eq(current).removeClass(ACTIVE);
					buttons.eq(index).addClass(ACTIVE);
					$(targets[current]).removeClass(ACTIVE);
					$(targets[index]).addClass(ACTIVE);

					if ($.isFunction(callback)) {
						callback.call(self, buttons.eq(index), targets[index], buttons.eq(current), targets[current]);
					}
					current = index;
				};
			}

			return this;
		},

		/* 头部背景图片预加载，这样切换的时候，会更自然 */
		slidePreload: function () {
			var self = this;

			// if (self.isPreload) {
			// 	return self;
			// }

			// var elHeader = self.el.header;

			// var elWithBg = elHeader.find('s');

			// elWithBg.each(function() {
			// 	var el = $(this);

			// 	// get background-image
			// 	var bg = el.css('background-image');
			// 	// get image url
			// 	var url = bg.split('"')[1];
			// 	// trigger load image
			// 	var img = new Image();
			// 	img.src = url;
			// });

			return self;
		},

		slideHomeApp: function () {
			var self = this;

			// 移动产品选项卡
			var elTabX = (self.el.tabApp = $('#tabApp'));
			var elTabLine = (self.el.tabLine = $('#tabLine'));

			// 切换按钮　
			var elTabBtns = elTabX.find('a');
			// 选项卡的回调方法
			var _callbackTab = function (isTrigger) {
				var elActive = elTabX.find('.' + ACTIVE),
					left = 0;
				if (elActive.length) {
					// 高亮线应该移动的位置
					left = elActive.position().left;
					// 宽度变化
					elTabLine.css({
						width: elActive.width()
					});
					if (win.SIZE == 'S') {
						elTabX.css('marginLeft', -left);
					}
					if (history.pushState) {
						// 使用tranform动画效果更好
						elTabLine.css({
							webkitTransform: 'translateX(' + left + 'px)',
							transform: 'translateX(' + left + 'px)'
						});
					} else {
						elTabLine.css({
							left: elActive.position().left
						});
					}
				}

				// 如果是app页面，同事变更整个页面的APP类型
				if (win.FN_hash && isTrigger !== true) {
					var hash = elActive.attr('data-hash');
					location.replace(location.href.split('#')[0] + '#' + hash);

					FN_hash();

					// 滚动加载图片显示
					self.el.container.trigger('scroll');
				}
			};
			self.slide(elTabBtns, _callbackTab);
			// 蓝色高亮线一开始就显示
			_callbackTab(true);

			// 移动端增加swipe切换的处理
			if (win.SIZE == 'S') {
				var elUl = $('#mobile ul');
				self.swipe(elUl, 'left', function () {
					var index = elTabX.find('.' + ACTIVE).data('index') * 1;

					index++;
					if (index > elTabBtns.length - 1) {
						index = 0;
					}
					// 切换进行
					elTabBtns.eq(index).trigger('click');
				});
				self.swipe(elUl, 'right', function () {
					var index = elTabX.find('.' + ACTIVE).data('index') * 1;

					index--;
					if (index < 0) {
						index = elTabBtns.length - 1;
					}

					// 切换进行
					elTabBtns.eq(index).trigger('click');
				});

				// 移动端不在新窗口打开
				$('#mobile a').removeAttr('target');
				$('.mNoBlank').removeAttr('target');
			}

			return self;
		},

		slideBrand: function () {
			var self = this;

			// 一些元素
			var elBrandDescX = (self.el.brandDescX = $('#brandDescX'));
			var elBrandNavX = (self.el.brandNavX = $('#brandNavX'));

			var elDescLs, elNavLs;

			if (elBrandDescX.length && elBrandNavX.length) {
				// 必要的元素检测
				// 如果没有异常，导航按钮和列表元素集合
				elDescLs = elBrandDescX.find('li');
				elNavLs = elBrandNavX.find('a');
				// nav导航和列表是一一对应的关系，因此，我们可以借助索引
				// 注意：此实现方法并不适用多人协作的项目，因为列表等具有变动性
				elNavLs.each(function (index) {
					$(this).data('index', index)
						// 事件
						.on('mouseenter', function () {
							var elNav = $(this),
								elActive = null,
								indexActive = -1,
								indexCurrent = elNav.data('index');

							// 避免鼠标误hover触发交互
							clearTimeout(self.timerNavHover);
							// 定时器保护，增加225毫米的延迟
							self.timerNavHover = setTimeout(function () {
								if (elNav.hasClass(ACTIVE) === false) {
									elActive = elBrandNavX.find('.' + ACTIVE);
									if (elActive.length == 1) {
										indexActive = elActive.data('index');
										elActive.removeClass(ACTIVE);
									}
									elNav.addClass(ACTIVE);
									// 对应的品牌动画效果
									// 1. 首先确定动画是否反方向，根据nav按钮在DOM中的前后顺序决定
									var isResverse = false;
									if (indexCurrent < indexActive) {
										isResverse = true;
									}

									var elDescActive = elDescLs.eq(indexActive);
									if (elDescActive.length) {
										elDescActive.removeClass('in').removeClass(REVERSE).addClass('out');
										if (isResverse) {
											elDescActive.addClass(REVERSE);
										}
									}
									elDescLs.eq(indexCurrent).addClass('in').removeClass(REVERSE).removeClass('out');
									if (isResverse) {
										elDescLs.eq(indexCurrent).addClass(REVERSE);
									}
								}
							}, 225);

						});
				});
				// 当从导航区域离开的时候，清除定时器
				elBrandNavX.on('mouseleave', function () {
					clearTimeout(self.timerNavHover);
				});
			}

			return self;
		},

		/* 头部广告图切换 */
		slideHomeHeader: function () {
			var self = this;

			// 头部元素
			var elHeader = self.el.header,
				elDots = self.el.dots;
			// hover时候预加载（如果没有预加载过的话）
			if (elHeader.length) {
				var _autoplay = function () {
					if (!self.timerSlide) {
						self.timerSlide = setInterval(function () {
							var index = $('#hdDotX .' + ACTIVE).data('index') * 1 + 1;
							if (!elDots[index]) {
								index = 0;
							}
							elDots.eq(index).trigger('click');
						}, 8000);
					}
				};
				if (win.SIZE == 'S') {
					setTimeout(function () {
						_autoplay();
					}, 8000);
				}
				if (win.SIZE !== 'S') {
					// 自动播放需要用户特定行为开启
					elHeader.on('mouseenter', function () {
						// 预加载
						// self.slidePreload();
						// 停止自动播放
						clearInterval(self.timerSlide);
						self.timerSlide = null;
					}).on('mouseleave', function () {
						// 继续自动播放
						_autoplay();
					});
					// 自动播放
					$(doc).on('mouseover', function () {
						if (!self.isPreload) {
							setTimeout(function () {
								if (!self.isPreload) {
									self.slidePreload();
								}
							}, 4000);

							// 鼠标进入页面，开启自动播放，用户不动我也不动
							setTimeout(function () {
								_autoplay();
							}, 6000);
						}
					});
				} else {
					self.swipe(elHeader, 'left', function () {
						var index = $('#hdDotX .' + ACTIVE).data('index') * 1;

						index++;
						if (index > elDots.length - 1) {
							index = 0;
						}
						// 切换进行
						elDots.eq(index).trigger('click');
					});
					self.swipe(elHeader, 'right', function () {
						var index = $('#hdDotX .' + ACTIVE).data('index') * 1;

						index--;
						if (index < 0) {
							index = elDots.length - 1;
						}

						// 切换进行
						elDots.eq(index).trigger('click');
					});
				}
			}

			return this;
		},

		// 二维码显示与隐藏
		showQr: function () {
			$(".jsLoadQr").on("mouseover mouseout", function (event) {
				$(".jsPicQr").toggle();
			});
		},
		// 顶部语言切换
		changeLg: function () {
			if (win.SIZE == 'S') {
				$(".jsChangeLg").click(function () {
					$("#ywHdBar").addClass('fixed');
					$("#ywLgUl").toggle();
				});
			} else {
				$(".jsChangeLg").on("mouseover mouseout", function (event) {
					if (event.type == "mouseover") {
						$("#ywIconArr").addClass('active');
					} else if (event.type == "mouseout") {
						$("#ywIconArr").removeClass('active');
					}
					$("#ywLgUl").toggle();
				});
			}
		},
		scrollBarFixed: function () {
			var self = this;
			var elHeader = self.el.header,
				container = self.el.container;
			// 标题栏
			self.el.hdBar = $('#ywHdBar');

			var elBar;
			// 标题栏导航按钮
			var elBarNav = $('#ywMnavBtn'),
				elBarNavName = $('#ywMnavName');
			self.el.barNav = elBarNav;

			// 当前导航位置
			var indexNav = 0;

			// 标记锚点对应的元素们
			var arrModule = [];
			var elMnavAs = $('#ywMnav > a').each(function (index) {
				var href = this.getAttribute('href');
				if (/^#/.test(href)) {
					arrModule.push($(href));
				}
				// 跟网页hash地址匹配
				var hash = location.hash.replace('&', '');
				if (hash == href) {
					indexNav = index;
				}
			});

			if (elHeader.length) {
				// 移动端顶部fixed效果
				if (win.SIZE == 'S') {
					elBar = self.el.hdBar;
					var qqHeader = $(".jsHeader");
					var imgAPP = $(".jsAppImg");

					// var blur = 0;
					// if (window.APP == 'QQ') {
					// 	container.css('overflow', 'hidden');

					// 	var data = {};
					// 	container.on('touchstart', function (event) {
					// 		var touches = event.touches[0] || event;
					// 		data.y = touches.pageY;
					// 		data.touching = true;

					// 	});
					// 	container.on('touchmove', function (event) {
					// 		if (!data.touching) {
					// 			return;
					// 		}
					// 		event.preventDefault();
					// 		var touches = event.touches[0] || event;
					// 		var moveY = data.y - touches.pageY;
					// 		console.log(moveY);

					// 		if (blur == 10) {

					// 		}


					// 	});
					// 	container.on('touchend', function (event) {
					// 		data.touching = false;

					// 	});
					// }

					// if (window.APP == 'QQ') {
					//  	qqHeader.css('height', 'calc(100vh + 80px)');
					//    }

					container.on('scroll', function (event) {
						var st = $(this).scrollTop(),
							distance = 50;
						// var footer = document.getElementById('ywFooter');
						// var footerBtm = footer.getBoundingClientRect().bottom;
						var winHeight = $(win).height();

						if (st <= 0) {
							elBar.removeClass('fixed');
							elBar.css('opacity', 1);
							$(".jsKfHeader").removeClass('fixed');
							if ($("#supervise").length > 0) {
								$("#ywBarX2").removeClass('yw-bar yw-bar-fixed');
								$("#ywHdBar").addClass('fixed');
							}
						} else if (st > 0 && st <= 50) {
							elBar.addClass('fixed');
							elBar.css('opacity', 1);
							$(".jsKfHeader").addClass('fixed');
						} else {

						}


						// 标题栏导航按钮默认选中内容变化
						var arrTop = $.map(arrModule, function (module) {
								return module[0].getBoundingClientRect().top;
							}),
							arrTopAbs = $.map(arrTop, function (top) {
								return Math.abs(top);
							});

						// 谁距离最小就是哪一个，头尾特殊处理
						var min = Math.min.apply(null, arrTopAbs);

						// 首位锚点元素特殊处理，其他谁最小就是谁
						$.each(arrTop, function (index, top) {

							if (
								(index == 0 && top > 0) ||
								(index == arrTop.length - 1 && top < 0) ||
								(Math.abs(top) == min)
							) {
								elMnavAs.removeClass(ACTIVE);
								elBarNavName.html(elMnavAs.eq(index).addClass(ACTIVE).html());
								indexNav = index;
							}
						});
					});

					// 标题栏不能拖动
					// elBar.on('touchstart', function(event) {
					// 	if ($(event.target).is('a') == false) {
					// 		event.preventDefault();
					// 	}
					// });

					// 移动端导航的出现与收起
					elBarNav.on('touchstart', function () {
						$(this).toggleClass(ACTIVE);
					});
				} else if (!win.APP) {
					if ($("#ywBarKeFux").length !== 0) {
						container.on('scroll', function () {
							var cl = $("#ywBarKeFux")[0].className.split(' ')[0] + '-fixed';
							var st = $(this).scrollTop();
							if (st <= 0) {
								$("#ywBarKeFux").removeClass(cl);
							} else {
								$("#ywBarKeFux").addClass(cl);
							}
						});
					}
					// 非移动端的处理
					// 官网首页的滚动交互
					elBar = $('#ywBarX');

					if (elBar.length == 0) {
						return self;
					}

					self.el.barX = elBar;
					// 当前的类名
					var cl = elBar[0].className.split(' ')[0] + '-fixed';
					var Joinbtn = $(".jsJoin");
					// 导航状态切换的方法
					var fnStatus = function (index, isHash) {
						// 导航状态切换
						elMnavAs.removeClass(ACTIVE);
						elMnavAs.eq(index).addClass(ACTIVE);

						var href = elMnavAs.eq(index).attr('href');

						if (isHash && /#/.test(href)) {
							location.replace('#&' + href.split('#')[1]);
						}

						indexNav = index;
					};

					container.on('scroll', function () {
						var st = $(this).scrollTop();
						if (st <= 0) {
							elBar.removeClass(cl);
							elBar.css('opacity', 1);
							Joinbtn.removeClass(ACTIVE);
						} else {
							elBar.addClass(cl);
							elBar.css('opacity', 1);
							Joinbtn.addClass(ACTIVE);
						}

						// 如果是点击触发，没有这么多事情
						if (self.triggerScroll) {
							$.each(arrModule, function (index, el) {
								if (el[0] == self.triggerScroll) {
									indexNav = index;
								}
							});
							return;
						}
						// 如果是最大滚动高度
						if (st == document.documentElement.scrollHeight - $(window).height()) {
							indexNav = arrModule.length - 1;
							fnStatus(indexNav, true);
							return;
						}

						if (st < arrModule[0].offset().top) {
							fnStatus(0, true);
						} else {
							// 标题栏导航按钮默认选中内容变化
							$.each(arrModule, function (index, module) {
								var ele = module[0];
								if (indexNav !== index && Math.abs(ele.getBoundingClientRect().top) <= 75) {
									// 导航状态切换
									fnStatus(index, true);
								}
							});
						}
					});

					if (indexNav != 0) {
						fnStatus(indexNav);
					}

					self.el.container.trigger('scroll');
				}
			}

			self.isPreload = true;

			return self;
		},
		bookScroll: function () {
			var self = this;

			// 全版权运营移动端
			self.el.copy = $('#ywBookX');

			var timerLongTap = null,
				targetLongTap = null;
			var elCopy = self.el.copy;

			if (!elCopy.length) {
				return;
			}
			// 无限滚动播放
			var elUls = elCopy.find('ul');
			// 数据
			var data = [{
				el: elUls.eq(0),
				speed: 30, // 每秒移动像素值
				x: 0,
				minX: -3600,
				timer: null
			}, {
				el: elUls.eq(1),
				speed: 25, // 每秒移动像素值
				x: 0,
				minX: -3600,
				timer: null
			}, {
				el: elUls.eq(2),
				speed: 21, // 每秒移动像素值
				x: 0,
				minX: -3600,
				timer: null
			}];

			var moveTo = function (el, move) {
				if ([].map) {
					// IE9+ transform
					el.css({
						msTransform: 'translateX(' + move + 'px)',
						transform: 'translateX(' + move + 'px)'
					});
				} else {
					el.css('marginLeft', move);
				}
			};

			$.each(data, function (index, params) {
				if (win.SIZE == 'S') {
					params.minX = -1800;
				}
				// 计算定时器
				var speed = params.speed;
				// 定时器最小时间
				var minTimeLoop = 1000 / 60;
				// 按照当前速度最小单元移动距离
				var speedEveryLoop = speed / 1000 * minTimeLoop;
				// 如果每次移动小于1像素
				// 重新确定新的循环时间
				if (win.SIZE != 'S' && speedEveryLoop < 1) {
					speedEveryLoop = 1;
					minTimeLoop = 1000 * 1 / speed;
				}
				// 参数保留
				params.timeLoop = minTimeLoop;
				params.speedLoop = speedEveryLoop;
				params.miniSpeedLoop = speedEveryLoop;

				params.el[0].dataParams = params;

				params.step = function () {
					clearTimeout(params.timer);

					var x = params.x;

					if (params.speedInertia && params.speedInertia > params.speedLoop + params.speedLoop) {
						params.speedInertia = params.speedInertia - (params.speedInertia - params.speedLoop) / (1000 / params.timeLoop);
					} else {
						params.speedInertia = params.speedLoop;
						params.inertiaing = false;
					}

					x = x - Math.max(params.speedLoop, params.speedInertia || 0);
					if (x < params.minX) {
						x = 0;
					}
					params.x = x;

					// 移动
					moveTo(params.el, x);

					if (!params.moving) {
						params.timer = setTimeout(params.step, params.timeLoop);
					}
				};

				params.step();

				// 复制列表，以便可以无限滚动
				var html = params.el.html();
				params.el.html(html + html);
			});
		},
		bookShow: function () {
			var self = this;
			var imgs = $("#ywBookShow img");
			var imgMsg = $("#ywBookMsg li");
			var imgLine = $("#tabBookLine");
			var INow = 7,
				target = 0;
			var off = true;
			var timerBook = null;
			var brightLight = {
				msFilter: 'brightness(60%)',
				filter: 'brightness(60%)',
				webkitFilter: 'brightness(60%)',
				oFilter: 'brightness(60%)',
				mozFilter: 'brightness(60%)'
			};
			var brightBold = {
				msFilter: 'brightness(100%)',
				filter: 'brightness(100%)',
				webkitFilter: 'brightness(100%)',
				oFilter: 'brightness(100%)',
				mozFilter: 'brightness(100%)'
			};
			var brightMiddle = {
				msFilter: 'brightness(70%)',
				filter: 'brightness(70%)',
				webkitFilter: 'brightness(70%)',
				oFilter: 'brightness(70%)',
				mozFilter: 'brightness(70%)'
			};
			Tab(INow);
			//0 1 2 3 4 5 6 7 8 9 10 11 12
			//7 8 9 10 11 12 0 1 2 3 4 5 6
			//6 7 8 9 10 11 12 0 1 2 3 4 5
			if (win.SIZE == 'S') {
				var elUl = $('#ywBookShow img');
				self.swipe(elUl, 'left', function (event) {
					var index = INow;
					index++;
					// 切换进行
					if (index == 15) {
						index = 0;
					}
					imgs.eq(index).trigger('click');
				});
				self.swipe(elUl, 'right', function (event) {
					var index = INow;
					index--;
					// 切换进行
					imgs.eq(index).trigger('click');
				});
			}
			var timerBook = setInterval(bookTime, 6000);
			var bookTime = function () {
				var index = INow;
				index++;
				if (index >= 15) {
					index = 0;
				}
				imgs.eq(index).trigger("click");
			};
			timerBook = setInterval(bookTime, 6000);
			for (var i = 0; i < imgs.length; i++) {
				//为每一张图片创建一个index
				imgs[i].index = i;
				//对图片创建点击事件
				imgs[i].onclick = function () {
					target = this.index;
					if (target == INow) {
						return false;
					}
					if (!off) {
						return;
					}
					off = false;

					if (target > INow) {
						if (target - INow < 8) {
							goNext();
						} else {
							goPre();

						}
					} else {
						if (target + 15 - INow < 8) {
							goNext();
						} else {
							goPre();
						}
					}
					clearInterval(timerBook);
					timerBook = setInterval(bookTime, 6000);
				};
			}

			function goNext() {
				INow++;
				if (INow > 14) {
					INow = 0;
				}
				Tab(INow);
				//如果到了目标点的时候就停止移动
				if (INow == target) {
					off = true;
					return;
				}

				setTimeout(function () {
					goNext();
				}, 100 / INow);
			}

			function goPre() {
				INow--;
				if (INow < 0) {
					INow = 14;
				}
				Tab(INow);
				//如果到了目标点的时候就停止移动

				if (INow == target) {
					off = true;
					return;
				}

				setTimeout(function () {
					goPre();
				}, 100 / INow);
			}
			//将第几张图片放在正中央
			//0 1 2 3 4 5 6 7 8 9 10 11 12 13 14  0 1 2 3 4 5 6 7 8 9 10 11 12 13 14
			//7 8 9 10 11 12 0 1 2 3 4 5 6        8 9 10 11 12 13 14 0 1 2 3 4 5 6 7
			//6 7 8 9 10 11 12 0 1 2 3 4 5 		  7 8 9 10 11 12 13 14 0 1 2 3 4 5 6
			function Tab(n) {
				for (var i = 0; i < 7; i++) {
					var left = n - 1 - i;
					//0在中间
					if (left < 0) {
						left = left + 15;
					}
					imgs.eq(left).css('transform', 'translateX(' + (-160 * (i + 1)) + 'px)translateZ(' + (160 - 110 * i) + 'px)');
					//12在中间
					var right = n + 1 + i;
					if (right > 14) {
						right = right - 15;
					}
					imgs.eq(right).css('transform', 'translateX(' + (160 * (i + 1)) + 'px)translateZ(' + (160 - 110 * i) + 'px)');
					imgLine.css('left', 6.66 * INow + '%');
				}
				imgs.eq(INow).css('transform', 'translateZ(300px)');
				imgs.css(brightMiddle);
				if (win.SIZE == 'S') {
					imgs.css(brightLight);
				}
				imgs.eq(INow).css(brightBold);
				setTimeout(function () {
					imgMsg.hide();
					imgMsg.eq(INow).css('display', 'block');
				}, 500);
			}
			imgs.css(brightMiddle);
			imgs.eq(INow).css(brightBold);
			imgs.on('mouseenter', function () {
				var index = this.index;
				imgs.eq(index).css(brightBold);
			}).on('mouseleave', function () {
				var index = this.index;
				imgs.css(brightMiddle);
				imgs.eq(INow).css(brightBold);
			});
		},
		tapHomeCopy: function () {
			var self = this;

			// 全版权运营移动端
			self.el.copy = $('#ywCopyX');

			var timerLongTap = null,
				targetLongTap = null;
			var elCopy = self.el.copy;

			if (!elCopy.length) {
				return;
			}


			// 无限滚动播放
			var elUls = elCopy.find('ul');
			// 数据
			var data = [{
				el: elUls.eq(0),
				speed: 30, // 每秒移动像素值
				x: 0,
				minX: -3600,
				timer: null
			}, {
				el: elUls.eq(1),
				speed: 20, // 每秒移动像素值
				x: 0,
				minX: -3600,
				timer: null
			}];

			// 拖拽
			var eventType = {
				start: 'mousedown',
				move: 'mousemove',
				end: 'mouseup'
			};

			if (win.SIZE == 'S') {
				eventType = {
					start: 'touchstart',
					move: 'touchmove',
					end: 'touchend'
				};
			}


			var moveTo = function (el, move) {
				if ([].map) {
					// IE9+ transform
					el.css({
						msTransform: 'translateX(' + move + 'px)',
						transform: 'translateX(' + move + 'px)'
					});
				} else {
					el.css('marginLeft', move);
				}
			};

			$.each(data, function (index, params) {
				if (win.SIZE == 'S') {
					params.minX = -1800;
				}
				// 计算定时器
				var speed = params.speed;
				// 定时器最小时间
				var minTimeLoop = 1000 / 60;
				// 按照当前速度最小单元移动距离
				var speedEveryLoop = speed / 1000 * minTimeLoop;
				// 如果每次移动小于1像素
				// 重新确定新的循环时间
				if (win.SIZE != 'S' && speedEveryLoop < 1) {
					speedEveryLoop = 1;
					minTimeLoop = 1000 * 1 / speed;
				}
				// 参数保留
				params.timeLoop = minTimeLoop;
				params.speedLoop = speedEveryLoop;
				params.miniSpeedLoop = speedEveryLoop;

				params.el[0].dataParams = params;

				params.step = function () {
					clearTimeout(params.timer);

					var x = params.x;

					if (params.speedInertia && params.speedInertia > params.speedLoop + params.speedLoop) {
						params.speedInertia = params.speedInertia - (params.speedInertia - params.speedLoop) / (1000 / params.timeLoop);
					} else {
						params.speedInertia = params.speedLoop;
						params.inertiaing = false;
					}

					x = x - Math.max(params.speedLoop, params.speedInertia || 0);
					if (x < params.minX) {
						x = 0;
					}
					params.x = x;

					// 移动
					moveTo(params.el, x);

					if (!params.moving) {
						params.timer = setTimeout(params.step, params.timeLoop);
					}
				};

				params.step();

				// 复制列表，以便可以无限滚动
				var html = params.el.html();
				params.el.html(html + html);

				// 停止的处理
				if (win.SIZE !== 'S') {
					params.el.on('mouseenter', function () {
						if (!params.inertiaing) {
							clearTimeout(params.timer);
						}
					}).on('mouseleave', function () {
						if (!params.moving && !params.inertiaing) {
							params.step();
						}
					});
				}

				// 事件
				params.el.on(eventType.start, function (event) {
					var target = (event.touches && event.touches[0]) || event;

					// 起始位置
					params.startX = target.pageX;
					// 记录时间戳
					params.timestamp = +new Date();
					params.moving = true;

					doc.currentActiveElement = this;
					doc.targetParams = params;
				});

				$(doc).on(eventType.move, function (event) {
					var params = doc.targetParams;
					if (!params || params.el[0] !== doc.currentActiveElement) {
						return;
					}

					var target = (event.touches && event.touches[0]) || event;
					// 移动X距离
					var moveX = target.pageX - params.startX;

					if (params.moving) {
						// 阻止默认行为
						event.preventDefault();
					}

					if (moveX >= 0 || !params.moving) {
						// 反方向移动，忽略
						return;
					}
					params.moveX = moveX;

					// 应对的x位置
					var targetX = params.x + moveX;
					if (targetX < params.minX) {
						targetX = 0;
					}
					params.targetX = targetX;
					moveTo(params.el, targetX);
				}).on(eventType.end, function () {
					var params = doc.targetParams;
					if (!params || !params.moving) {
						return;
					}
					// 计算速度
					var timeBetween = +new Date() - params.timestamp;
					var moveX = params.moveX;
					params.moving = false;

					// 速度，每次帧循环移动距离
					var speedMoveAs1px = -1 * params.speedLoop * moveX / timeBetween;

					if (Math.abs(moveX) > 5) {
						params.inertiaing = true;
						params.speedInertia = speedMoveAs1px * 10;
						params.x = params.targetX;
					}

					params.step();
				});

				// 移动端长按出现提示
				if (win.SIZE == 'S') {
					// 手指滑动不认为是长按
					var posCopy = {
						x: 0,
						y: 0
					}
					elCopy.find('li > div').on({
						touchstart: function (event) {
							var target = event.touches[0] || event;

							posCopy = {
								x: target.pageX,
								y: target.pageY
							};

							var li = this;
							// 检测是否长按
							targetLongTap = li;

							timerLongTap = setTimeout(function () {
								if (targetLongTap == li) {
									$(li).addClass(ACTIVE);
								}
							}, 500);
						}
					});

					$(doc).on('touchend', function () {
						clearTimeout(timerLongTap);
						targetLongTap = null;
						elCopy.find('.' + ACTIVE).removeClass(ACTIVE);
					}).on('touchmove', function (event) {
						var target = event.touches[0] || event;
						if (Math.abs(target.pageX - posCopy.x) > 5 || Math.abs(target.pageY - posCopy.y) > 5) {
							clearTimeout(timerLongTap);
						}
					});
				}
			});



			return self;
		},
		// 新闻中心滑屏和footer滑屏
		swipeMore: function () {
			var self = this;
			var tabNewLine = $('#tabNewLine');
			var ywNewsUl = $("#ywNewsUl");
			var ywNewsLi = $('.jsNewsLi');
			var i = 0,
				a = 0;
			var distanceLi = 310;
			var ywNewsLength = 4;
			var distanceLine = 25;
			var ywContactUl = $("#ywContactUl");
			var ywContactLi = $(".jsContactLi");
			var distanceCli = 240;
			var container = self.el.container;

			self.swipe(ywNewsUl, 'left', function () {
				i++;
				if (i > 3) {
					i = 3;
				}
				ywNewsUl.css('left', '-' + distanceLi * i + 'px');
				tabNewLine.css('marginLeft', +distanceLine * i + '%');
			});
			self.swipe(ywNewsUl, 'right', function () {
				i--;
				if (i < 0) {
					i = 0;
				}
				ywNewsUl.css('left', '-' + distanceLi * i + 'px');
				tabNewLine.css('marginLeft', +distanceLine * i + '%');
			});

			self.swipe(ywContactUl, 'left', function () {
				a++;
				if (a == 2) {
					$(".jsContactI").css('display', 'none');
				} else {
					$(".jsContactI").css('display', 'block');
				}
				if (a > 2) {
					a = 2;
				}
				ywContactUl.css('left', '-' + distanceCli * a + 'px');
			});
			self.swipe(ywContactUl, 'right', function () {
				a--;
				if (a < 0) {
					a = 0;
				}
				ywContactUl.css('left', '-' + distanceCli * a + 'px');
			});
		},
		/**
		 * 获取新闻信息
		 */
		getNews: function () {
			var self = this;

			// 请求地址
			var url = self.urlNewsList;

			// 元素
			var elTemp = $('#tempNews'),
				elBox = elTemp.parent(),
				elLoading = $('#newsLoading');
			// 模板html
			var htmlTemp = elTemp.html();

			// 极简模板
			$.template = function (str, obj) {
				return str.replace(/\$\w+\$/gi, function (matchs) {
					var returns = obj[matchs.replace(/\$/g, "")];
					return (returns + "") == "undefined" ? "" : returns;
				});
			};

			// 根据JSON返回数据
			var _template = function (data) {
				return $.map(data, function (obj) {
					$.each(obj, function (key, value) {
						obj[key] = value.replace(/<|&|>/g, function (matchs) {
							return ({
								'<': '&lt;',
								'>': '&gt;',
								'&': '&amp;'
							})[matchs];
						});

						if (key == 'created_at') {
							obj[key] = obj[key].split(' ')[0];
						} else if (key == 'desc') {
							obj[key] = obj[key].replace(/\r|\n/g, '<br>');
						}
					});
					return $.template(htmlTemp, obj);
				}).join('');
			};

			// 显示更多新闻
			var elOverlay = $('#ywNewslay'),
				elNewslay = elOverlay.children('div');
			// 关闭框框
			elOverlay.delegate('.jsShut', 'click', function () {
				elOverlay.hide();
				if (win.SIZE != 'S') {
					doc.documentElement.style.overflow = '';
					$(doc.body).css('border-right', '0');
				}
			});

			var lastP = function (text) {
				return '<p class="yw-news-fn">' + text + '</p>';
			};

			// 加载完毕的信息
			var htmlFn = lastP('更多消息请关注「阅文集团」公众号');

			// 框框里面的加载更多
			// elOverlay.delegate('.jsLayMore', 'click', function() {
			// 	var btn = $(this), page = btn.attr('data-page');
			// 	// 请求
			// 	btn.html('加载中...');

			// 	$.ajax({
			// 		url: url,
			// 		dataType: 'json',
			// 		data: {
			// 			more: 1,
			// 			page: page
			// 		},
			// 		success: function(json) {
			// 			var listInfo = json.data && json.data.listInfo;
			// 			// 分页信息
			// 			var pageInfo = json.data && json.data.pageInfo;
			// 			alert('sdfdf');
			// 			console.log(pageInfo);
			// 			// 数据判断和处理
			// 			if (json.code == 0 && listInfo && listInfo.length > 0 && pageInfo) {
			// 				var htmlAll = _template(listInfo);

			// 				btn.before(htmlAll);

			// 				if (pageInfo.pageIndex >= pageInfo.pageMax) {
			// 					btn.before(htmlFn).remove();
			// 				} else {
			// 					btn.attr('data-page', pageInfo.pageIndex + 1);
			// 				}

			// 				return;
			// 			}
			// 			// 如果数据不合乎预期，我们都认为是全部加载结束
			// 			btn.before(htmlFn).remove();
			// 		},
			// 		complete: function() {
			// 			btn.html('查看更多');
			// 		},
			// 		error: function() {
			// 			btn.before(lastP('网络异常，没有加载成功')).remove();
			// 		}
			// 	});
			// });


			elBox.delegate('a[data-page]', 'click', function () {
				var data = {
					more: 1,
					page: $(this).attr('data-page')
				};

				// 显示遮罩层
				elOverlay.show();

				// 背景锁定
				if (win.SIZE != 'S') {
					var widthScrollbar = 17;
					if (typeof win.innerWidth == 'number') {
						widthScrollbar = win.innerWidth - doc.documentElement.clientWidth;
					}
					doc.documentElement.style.overflow = 'hidden';

					$(doc.body).css('border-right', widthScrollbar + 'px solid transparent');
				}

				var clLay = 'yw-news-lay';

				if (elNewslay.hasClass(clLay)) {
					return;
				}

				// 请求走起
				$.ajax({
					url: url,
					dataType: 'json',
					data: data,
					success: function (json) {
						if (json.code == 0) {
							var htmlAll = '',
								newData = [];
							if (json.data && json.data.listInfo) {
								newData = json.data.listInfo;
								// 最大数据量
								var pageInfo = json.data.pageInfo || {
									totalCount: 0,
									pageIndex: 1,
									pageNum: 2,
									pageMax: 1
								};

								htmlAll = _template(newData);

								if (pageInfo.pageIndex < pageInfo.pageMax) {
									// 查看更多新闻
									var more = '<a href="javascript:" class="yw-news-btn jsLayMore" data-page="' + (pageInfo.pageIndex + 1) + '">查看更多新闻</a>';
									htmlAll = htmlAll + htmlFn;
								} else {
									htmlAll = htmlAll + htmlFn;
								}
							} else {
								htmlAll = _template(self.jsonNews) + htmlFn;
							}
							// 尺寸处理
							elNewslay.addClass(clLay);

							if (win.SIZE == 'S') {
								// 移动端
								elNewslay.css({
									width: window.innerWidth - 20,
									height: window.innerHeight - 20
								});
							} else {
								elNewslay.css({
									width: 560,
									height: '90%'
								});
							}
							// 赋内容
							htmlAll = '<a href="javascript:" class="' + clLay + '-shut jsShut">×</a><div class="' + clLay + '-x">' + htmlAll + '</div>';
							if (history.pushState) {
								setTimeout(function () {
									elNewslay.html(htmlAll);
								}, 250);
							} else {
								elNewslay.html(htmlAll);
							}
						} else {
							elNewslay.html('<div class="error">' + (json.msg || '网络异常，稍后重试') + '</div>');
						}
					},
					error: function () {
						elNewslay.html('<div class="error">网络异常，稍后重试</div>');
					}
				});
			});

			if (url) {
				var htmlError = '新闻内容没能获取成功，' + ([].map ? '<a href="javascript:" onclick="$(this).parent().empty();YUEWEN.getNews();" style="color:#019EE4;">点击这里</a>重试。' : '<a href="">刷新</a>重试。');

				$.ajax({
					url: url,
					dataType: 'json',
					success: function (json) {
						if (json.code == 0) {
							if (json.data && json.data.length) {
								// 查看更多新闻
								elBox.html(_template(json.data) + '<a href="javascript:" class="yw-news-btn" data-page="1">查看更多新闻</a>');
								self.jsonNews = json.data;
							} else {
								elLoading.html('新闻已下架，编辑正在更新内容，请稍等...');
							}
						} else {
							elLoading.html(json.msg || htmlError);
						}
					},
					error: function () {
						elLoading.html(htmlError);
					}
				});
			}

			return self;
		},
		changeInvest: function () {
			var jsInvest = $("#jsInvest");
			if (win.SIZE == 'S' && jsInvest.length > 0) {
				jsInvest.html(jsInvest.html().replace(/<br\/?>/gi, ""));
			}
			var ywFooterMore = $("#ywFooterMore");
			if (win.SIZE == 'S' && ywFooterMore.length > 0) {
				$("#ywFooterMore").css('line-height', '18px');
				$("#ywFooter").css('height', '70px');
				ywFooterMore.html('<a href="./supervise.html" target="_blank"><b>舞弊监督举报</b></a> | 舞弊举报电话：021-61870509<br/>内容举报电话：010-59357051');
			}
		},
		// 所有页面滚动动画效果
		scrollAnimate: function () {
			var self = this;
			var container = self.el.container;
			var inPage = self.el.inPage;
			// app元素的dom
			var dom = document.getElementsByClassName('jsSlideApp');
			var domActive = '';
			var num = 0;
			var jsSlideLi = $(".jsAppUl li");

			container.on('scroll', function (event) {

				for (var i = 0; i <= 2; i++) {
					if (self.inPage(dom[i])) {
						jsSlideLi.eq(3 * i + 0).addClass('yw-slide-s');
						jsSlideLi.eq(3 * i + 1).addClass('yw-slide-m');
						jsSlideLi.eq(3 * i + 2).addClass('yw-slide-l');
					}
				}
				if (self.inPage(dom[2])) {
					jsSlideLi.eq(9).addClass('yw-slide-xl');
				}

				for (var i = 3; i <= dom.length - 1; i++) {
					if (self.inPage(dom[i])) {
						jsSlideLi.eq(3 * i + 1).addClass('yw-slide-s');
						jsSlideLi.eq(3 * i + 2).addClass('yw-slide-m');
						jsSlideLi.eq(3 * i + 3).addClass('yw-slide-l');
					}
				}
			});
		},
		inPage: function (dom) {
			var self = this;
			var dom = dom;
			var rect = dom.getBoundingClientRect();
			var selectorBottom = rect.bottom;
			var selectorTop = rect.top;
			var selectorLeft = rect.left;
			var selectorRight = rect.right;
			var windowHeight = window.innerHeight;

			if (selectorBottom > 0 && selectorTop < windowHeight && selectorLeft > 0 && selectorRight > 0) {
				return true;
			}
		},
		/**
		  简易弹框显示图片
		* @param url {String} 图片地址
		* @return 当前单例对象
		*/
		showImage: function (url) {
			var self = this;
			// 蒙层兼弹框元素
			var overlay = self.el.overlay;
			if (!overlay) {
				overlay = $('#ywOverlay');
				overlay.data('origin', overlay.html()).on('click', function () {
					$(this).removeClass(ACTIVE).hide();
				});
				self.el.overlay = overlay;
			} else if (overlay.data('lasturl') === url) {
				// 直接显示
				overlay.addClass(ACTIVE).show();
				return;
			} else {
				// 清除图片相关HTML
				overlay.html(overlay.data('origin'));
			}

			var box = overlay.children('div').removeAttr('style');


			// 显示loading状态
			overlay.show();

			// get图片
			var image = new Image();
			image.onload = function () {
				var width = this.width,
					height = this.height;

				// 故意来点延迟，包装效果更自然
				setTimeout(function () {
					box.css({
						width: width,
						height: height
					}).html('<img src="' + url + '">');
					overlay.data('lasturl', url);

					if (win.SIZE == 'S') {
						// 微信二维码尺寸变小
						box.css({
							width: 200,
							height: 200
						});
						box.find('img').css({
							width: 200,
							height: 200
						});
					}
				}, 200);

			};
			image.onerror = function () {
				box.html('<div class="error">图片显示异常，请重试</div>');
			};
			image.src = url;

			return this;
		},
		/**
		  页面滚动到对应元素位置
		* @param el {Object} jQuery或Zepto的包装器对象
		* @param callback {Function} 滚动到位的回调函数
		* @return 当前单例对象
		*/
		scrollIntoView: function (el, callback, direction) {
			var self = this;

			var $win = self.el.container;

			// 方向
			direction = direction || 'top';

			// 滚动方法名称
			var scrollMethod = 'scroll' + direction.slice(0, 1).toUpperCase() + direction.slice(1, direction.length);



			if (el && el.length) {
				// 清除定时器
				clearTimeout(self.timerScroll);

				// 需要滚动的高度
				var st = $win[scrollMethod](),
					offT = el.offset()[direction] + st;

				// 手机模式下，要增加顶部工具栏的偏移大小
				if (win.SIZE == 'S') {
					offT -= 50;
				} else if (!win.APP) {
					offT = el.offset()[direction] - 74;
				}

				// 速率，当前滚动位置
				var rate = 10,
					nowSt = st;

				var step = function () {
					var move = (offT - nowSt) / rate;
					if (Math.abs(move) < 1 / rate) {
						$win[scrollMethod](offT);
						if ($.isFunction(callback)) {
							callback.call(el[0]);
						}
					} else {
						nowSt = nowSt + move;
						$win[scrollMethod](nowSt);
						self.timerScroll = setTimeout(step, 20);
					}
				};
				step();
			}
			return self;
		},
		// supervise页面
		scrollSupervise: function () {
			if ($("#supervise").length > 0) {
				if (win.SIZE == 'S') {
					$("#ywBarX2").removeClass('yw-bar yw-bar-fixed');
					$("#ywHdBar").addClass('fixed');
					$("#ywHeader").css('display', 'block');
				} else {
					$("#ywHeader").css('display', 'none');
					$("#ywBarX2").addClass('yw-bar-fixed');
					$(".jsJoin").removeClass('active');
				}
			}
			// 点击顶部导航，将参数带到首页
			var location = window.location.href;
			if (location.indexOf('from=') > -1 && win.SIZE == 'S') {
				var name = decodeURI(location.split('from=')[1].split('#')[0]);
				$("#ywMnavName").html(name);
				$("#ywHdBar").addClass('fixed');
			}
		},
		kfLogin: function () {
			var self = this;
			var locationHref = location.href;
			ywLogin.init({
				env: '', //当前页面环境变量，如果不传递则默认为线上环境的登录。
				appId: 37, //必传
				areaId: 6, //必传,
				isLogin: false, //业务侧直出了就传递，否则不传递，默认业务侧没有传递。当然，传递了就以此为登录标识而不是通过判断登录态。
				loginApi: 'passport.yuewen.com/yuewen.html', //默认为ptpassport.qidian.com，其他域名下站点可参考我的文档
				returnUrl: locationHref, //现在只是demo页登录代理页地址，实际默认为当前页面地址。如果是弹窗登录，此时必须设置为登录代理页地址，需写全协议头，且与当前页保持一致，防止跨域，关于代理页，可以参考登录组件文档中的【登录代理页】一节
				success: function () { //弹窗登录的登录成功回调
					showLogout();
				},
				logout: function () { //弹窗登录的退出登录成功回调
					// showLogin();
				},
				autoSuccess: function () { //如果不设置则默认不需要处理自动登录逻辑，关于自动登录的概念，可看登录组件说明文档中的【自动登录】一节
					showLogout();
				}
			}).autoLogin(); //初始化登录组件并同时进行登录态的校验，如果校验成功则进行自动登录

			//获取登录链接,获取登录url,重置returnurl，跳登录页形式的登录，我希望登录成功后回到我自己的页面
			var loginLink = document.querySelectorAll('.jsLoginKeFu');
			for (var i = 0; i < loginLink.length; i++) {
				loginLink[i].setAttribute('href', ywLogin.getLoginUrl());
			}

			function showLogout() {
				var cookie = document.cookie;
				var cookieGuid = (cookie.indexOf('ywguid=') > -1) && cookie.split('ywguid=')[1].split(';')[0];
				var uid = '';
				var hrefAsk = '';
				// 拼接在线咨询的链接
				$(".jsOnlineAsk").show();
				// 判断外链里面是否带uid，如果带则用外链的，如果不带则用阅文域的
				if (locationHref.toLowerCase().indexOf('&uid=') > -1 || locationHref.toLowerCase().indexOf('?uid=') > -1) {
					uid = locationHref.toLowerCase().split('uid=')[1].split('&')[0];
					hrefAsk = 'http://yw.95ib.com/online?uid=' + uid + '&userid=' + cookieGuid;
				} else {
					hrefAsk = 'http://yw.95ib.com/online?uid=435&userid=' + cookieGuid;
				}
				$(".jsOnlineAsk").attr('href', hrefAsk);
			}
		},
		/**
		  整站通用的交互事件处理
		*/
		eventsGlobal: function () {
			var self = this;

			$(doc).delegate('a', 'click', function (event) {
				var hrefAttr = this.getAttribute('href'),
					href = this.href;
				// 页面锚点跳转
				if (/^#/.test(hrefAttr)) {
					self.scrollIntoView($(hrefAttr), function () {
						// 标记当前hash
						if (win.SIZE != 'S') {
							location.replace('#&' + hrefAttr.split('#')[1]);
							self.triggerScroll = null;
						}
					});

					if (win.SIZE == 'S') {

					} else if (/nav/.test(this.className)) {
						self.triggerScroll = this;
						$(this).addClass(ACTIVE).siblings('a').removeClass(ACTIVE);
					}

					event.preventDefault();
				}
				// 打开图片
				else if (/\.(?:png|jpg)$/.test(hrefAttr)) {
					self.showImage(hrefAttr);
					event.preventDefault();
				} else if (/#/.test(hrefAttr)) {
					// IE7 maybe
					$(this).parent().find('.' + ACTIVE).removeClass(ACTIVE);
					$(this).addClass(ACTIVE);
				}
			});

			// 资源的滚动加载
			this.scrollLoading($('img[data-src]'));

			return self;
		},

		// 客服页-获取公告
		getKfNotice: function () {
			var self = this;

			// 请求地址
			var url = self.urlKfNotice;

			// 元素
			var elTemp = $('#tempNotice'),
				elBox = elTemp.parent(),
				elLoading = $('#noticeLoading');
			// 模板html
			var htmlTemp = elTemp.html();

			// 极简模板
			$.template = function (str, obj) {
				return str.replace(/\$\w+\$/gi, function (matchs) {
					var returns = obj[matchs.replace(/\$/g, "")];
					return (returns + "") == "undefined" ? "" : returns;
				});
			};

			// 根据JSON返回数据
			var _template = function (data) {
				return $.map(data, function (obj) {
					$.each(obj, function (key, value) {
						if (key == 'id') {
							return;
						} else {
							obj[key] = value.replace(/<|&|>/g, function (matchs) {
								return ({
									'<': '&lt;',
									'>': '&gt;',
									'&': '&amp;'
								})[matchs];
							});
						}

						if (key == 'createTime') {
							obj[key] = obj[key].split(' ')[0];
						} else if (key == 'desc') {
							obj[key] = obj[key].replace(/\r|\n/g, '<br>');
						}
					});
					return $.template(htmlTemp, obj);
				}).join('');
			};

			if (url) {
				var htmlError = '新闻内容没能获取成功，' + ([].map ? '<a href="javascript:" onclick="$(this).parent().empty();YUEWEN.getKfNotice();" style="color:#019EE4;">点击这里</a>重试。' : '<a href="">刷新</a>重试。');
				var data = {
					page: 1
				};
				$.ajax({
					url: url,
					dataType: 'json',
					data: data,
					success: function (json) {
						if (json.code == 0) {
							if (json.data.listInfo && json.data.listInfo.length) {
								// 查看更多新闻
								elBox.html(_template(json.data.listInfo));
								self.jsonNews = json.data.listInfo;
							} else {
								elLoading.html('新闻已下架，编辑正在更新内容，请稍等...');
							}
						} else {
							elLoading.html(json.msg || htmlError);
						}
					},
					error: function () {
						elLoading.html(htmlError);
					}
				});
			}
		},
		// 客服页-获取热门
		getKfNews: function () {
			var self = this;

			// 请求地址
			var url = self.urlKfNewsList;

			// 元素
			var elTemp = $('#tempKfNews'),
				elBox = elTemp.parent(),
				elLoading = $('#hotLoading');
			// 模板html
			var htmlTemp = elTemp.html();

			var lastP = function (text) {
				return '<p class="yw-news-fn">' + text + '</p>';
			};

			// 加载完毕的信息
			var htmlFn = lastP('更多消息请关注「阅文服务管家」公众号');
			// 极简模板
			$.template = function (str, obj) {
				return str.replace(/\$\w+\$/gi, function (matchs) {
					var returns = obj[matchs.replace(/\$/g, "")];
					return (returns + "") == "undefined" ? "" : returns;
				});
			};

			// 根据JSON返回数据
			var _template = function (data) {
				return $.map(data, function (obj) {
					$.each(obj, function (key, value) {
						if (key == 'id') {
							return;
						} else {
							obj[key] = value.replace(/<|&|>/g, function (matchs) {
								return ({
									'<': '&lt;',
									'>': '&gt;',
									'&': '&amp;'
								})[matchs];
							});
						}
						if (key == 'createTime') {
							obj[key] = obj[key].split(' ')[0];
						} else if (key == 'desc') {
							obj[key] = obj[key].replace(/\r|\n/g, '<br>');
						}
					});
					return $.template(htmlTemp, obj);
				}).join('');
			};

			var elOverlay = $('#ywNewslay'),
				elNewslay = elOverlay.children('div');
			var clLay = 'yw-news-lay';

			if (elNewslay.hasClass(clLay)) {
				return;
			}
			// 关闭框框
			elOverlay.delegate('.jsShut', 'click', function () {
				elOverlay.hide();
				if (win.SIZE != 'S') {
					doc.documentElement.style.overflow = '';
					$(doc.body).css('border-right', '0');
				}
			});
			// 关闭框框
			elBox.delegate('a[data-page]', 'click', function () {
				var data = {
					page: $(this).attr('data-page')
				};

				// 显示遮罩层
				elOverlay.show();

				// 背景锁定
				if (win.SIZE != 'S') {
					var widthScrollbar = 17;
					if (typeof win.innerWidth == 'number') {
						widthScrollbar = win.innerWidth - doc.documentElement.clientWidth;
					}
					doc.documentElement.style.overflow = 'hidden';

					$(doc.body).css('border-right', widthScrollbar + 'px solid transparent');
				}

				var clLay = 'yw-news-lay';

				if (elNewslay.hasClass(clLay)) {
					return;
				}

				// 请求走起
				$.ajax({
					url: url,
					dataType: 'json',
					data: data,
					success: function (json) {
						if (json.code == 0) {
							var htmlAll = '',
								newData = [];
							if (json.data && json.data.listInfo) {
								newData = json.data.listInfo;
								// 最大数据量
								var pageInfo = json.data.pageInfo || {
									totalCount: 0,
									pageIndex: 1,
									pageNum: 2,
									pageMax: 2
								};

								htmlAll = _template(newData);

								if (pageInfo.pageIndex < pageInfo.pageMax) {
									// 查看更多新闻
									var more = '<a href="javascript:" class="yw-news-more-btn jsLayMore" data-page="' + (pageInfo.pageIndex + 1) + '">查看更多新闻</a>';
									htmlAll = htmlAll + '';
								} else {
									htmlAll = htmlAll + htmlFn;
								}
							} else {
								htmlAll = _template(self.jsonNews);
							}
							// 尺寸处理
							elNewslay.addClass(clLay);

							if (win.SIZE == 'S') {
								// 移动端
								elNewslay.css({
									width: window.innerWidth - 20,
									height: window.innerHeight - 20
								});
							} else {
								elNewslay.css({
									width: 560,
									height: '90%'
								});
							}
							// 赋内容
							htmlAll = '<a href="javascript:" class="' + clLay + '-shut jsShut">×</a><div class="' + clLay + '-x">' + htmlAll + '</div>';
							if (history.pushState) {
								setTimeout(function () {
									elNewslay.html(htmlAll);
								}, 250);
							} else {
								elNewslay.html(htmlAll);
							}
						} else {
							elNewslay.html('<div class="error">' + (json.msg || '网络异常，稍后重试') + '</div>');
						}
					},
					error: function () {
						elNewslay.html('<div class="error">网络异常，稍后重试</div>');
					}
				});
			});
			if (url) {
				var htmlError = '新闻内容没能获取成功，' + ([].map ? '<a href="javascript:" onclick="$(this).parent().empty();YUEWEN.getKfNews();" style="color:#019EE4;">点击这里</a>重试。' : '<a href="">刷新</a>重试。');

				$.ajax({
					url: url,
					dataType: 'json',
					success: function (json) {
						if (json.code == 0) {
							if (json.data.listInfo && json.data.listInfo.length) {
								// 查看更多新闻
								// elBox.html(_template(json.data));
								elBox.html('<h4 class="yw-news-h yw-news-hot-h yw-font">热门</h4>' + _template(json.data.listInfo) + '<a href="javascript:" class="yw-news-more-btn jsLayMore" data-page="1">查看更多新闻</a>');
								self.jsonNews = json.data.listInfo;
							} else {
								elLoading.html('新闻已下架，编辑正在更新内容，请稍等...');
							}
						} else {
							elLoading.html(json.msg || htmlError);
						}
						if (win.SIZE == 'S') {
							// 隐藏查看更多按钮
							$(".jsNews").append($(".jsNotice"));
							// $(".jsLayMore").hide();
						}
					},
					error: function () {
						elLoading.html(htmlError);
					}
				});
			}
		},
		// 客服页-hover显示邮箱
		showkfEmail: function () {
			$(".jsKfEmail").on("mouseover mouseout", function (event) {
				$(".jsKfEmail div").toggleClass(ACTIVE);
			});
		},
		/**
		  官网首页的一些交互脚本
		*/
		eventsHome: function () {
			var self = this;

			// 首9页顶部banner切换
			self.slideHomeHeader();

			// 顶部栏拖动跟随效果
			self.scrollBarFixed();

			// 首页app选项卡
			self.slideHomeApp();

			// 品牌切换交互效果
			self.slideBrand();
			self.changeInvest();

			// 版权运营移动端长按出现描述
			// self.tapHomeCopy();

			// scrollSupervise页面
			self.scrollSupervise();

			// 语言切换
			self.changeLg();

			// 显示我们
			if (win.SIZE !== 'S') {
				$(".jsJoin").find('span').removeClass('hidden');
			}
			// 移动端收起导航
			var elBarNav;
			if (win.SIZE == 'S') {
				elBarNav = self.el.barNav || $('#ywMnavBtn');
				$('#ywMnav').click(function () {
					elBarNav.removeClass(ACTIVE);
				});
			}
			// ie9以下
			if (![].map) {
				$("#ywBookShow").removeClass('yw-book-show').addClass('yw-book-show-ie');
				$(".yw-book-show-pic").removeClass('yw-book-show-pic').addClass('yw-book-show-pic-ie');
				$("#copyright").css('height', '570px');
				// IE9一下不支持animate动画，恢复出厂设置
				$(".yw-hd-slide-h .yw-hd-slide-p .yw-hd-app-dld .yw-app-shine-li").css('opacity', '1');
			}
			// 全版权营销
			self.bookShow();
			self.bookScroll();
			// 获取新闻
			if ($("#kefuNews").length) {
				// 登录
				self.kfLogin();

				// 获取公告
				self.getKfNotice();

				// 获取热门新闻
				self.getKfNews();

				// 阅文客服-hover显示客服邮箱
				self.showkfEmail();

			} else if ($("#news").length) {
				self.getNews();
			}
			if ($("#ywBarKeFux").length) {
				// 登录
				self.kfLogin();
			}
			// 新闻中心和底部滑屏
			self.swipeMore();
			return self;
		},

		/**
		  app详情页面的一些交互脚本
		*/
		eventsApp: function () {
			var self = this;
			// 判断iOS还是Android
			var regAndroid = /Android/i,
				isAndroid = regAndroid.test(navigator.userAgent);

			//手机下的Android下载地址使用data-href地址
			//2016-06-08 下面全部注释是因为现在使用应用宝的动态地址，会自动判断设备
			if (win.SIZE == 'S') {
				$('a[data-href]').each(function () {
					$(this).attr('href', $(this).attr('data-href')).removeAttr('data-href');
				});
			}
			//移动端下载按钮动态地址
			$('.dlBtn').each(function () {
				var ele = this;
				var href = ele.getAttribute('href');
				if (href == '') {
					// 从前面2个a标签按钮处获得响应的下载地址
					$(ele).siblings('a').each(function () {
						var html = this.innerHTML;
						if (isAndroid && regAndroid.test(html)) {
							ele.href = this.href;
						} else if (isAndroid == false && /ios/i.test(html)) {
							ele.href = this.href;
						}
					});
				}
			});

			$(".jsJoinApp").html('加入我们');

			// 顶部栏拖动跟随效果

			self.scrollBarFixed();

			// 首页app选项卡
			self.slideHomeApp();

			// 首页顶部banner切换
			self.slideHomeHeader();

			// 底部字过多
			self.changeInvest();

			// 新闻中心和底部滑屏
			self.swipeMore();

			// 滚动加载动画
			self.scrollAnimate();

			// 显示下载二维码
			self.showQr();

			// 移动端收起导航
			var elBarNav;
			if (win.SIZE == 'S') {
				elBarNav = self.el.barNav || $('#ywMnavBtn');
				$('#ywMnav').click(function () {
					elBarNav.removeClass(ACTIVE);
				});
				$('#ywMnav a').click(function () {
					var href = $(this).attr('href');
					setTimeout(function () {
						window.location.reload();
					}, 60);
				});
				for (var i = 0; i < $(".jsHdApp").length; i++) {
					if ($(".jsHdApp").eq(i).css('display') == 'block') {
						$("#ywMnavName").html($(".jsHdApp").eq(i).attr('data-name'));
					}
				}
				$(".jsAppHref").click(function () {
					setTimeout(function () {
						window.location.reload();
					}, 60);
				});
			}

			// IE7,IE8图片满屏显示
			var scale = 1;
			// 图片宽度是1440，所以，可以对比下尺寸
			if (![].map && (scale = $(win).width() / 1440) > 1) {
				// 图片超出剪裁
				self.el.header.css('overflow', 'hidden')
					// 比例放大以及重定位
					.find('s').each(function () {
						var elS = $(this);
						elS.css('zoom', scale).css('left', -0.5 * $(win).width() * (scale - 1));
					});
			}

			// 选项卡hover头图预加载
			var elTabX = self.el.tabApp;
			if (elTabX) {
				elTabX.find('a').on({
					mouseenter: function () {
						var ele = this,
							el = $(ele),
							index = -1,
							imgurl = '';
						if (!ele.isPreload) {
							index = +el.data('index') + 1;

							imgurl = $('#hdAPP' + index).find('s').css('background-image');
							if (imgurl) {
								imgurl = imgurl.split('"')[1];
								if (imgurl) {
									new Image().src = imgurl;
								}
							}
						}

						ele.isPreload = true;
					}
				});
			}
			if (win.SIZE == 'S') {
				$("#ywHdBar").addClass('fixed');
			}
			return self;
		},

		init: function () {
			var self = this;
			// 确定页面的容器
			// 移动端是页面
			self.el.container = (win.SIZE == 'S' ? $('#ywPage') : $(win));
			// 一些全局元素
			self.el.header = $('#ywHeader');
			self.el.dots = $('#hdDotX a');

			if (win.APP) {
				self.eventsApp();
			} else {
				self.eventsHome();
			}

			self.eventsGlobal();

			if ($(".jsHXload")) {
				var ua = ywurl.uA;
				if (ua == 7) {
					$(".jsHXload").attr('href', 'https://itunes.apple.com/cn/app/%E7%BA%A2%E8%A2%96%E6%B7%BB%E9%A6%99%E4%B9%A6%E5%9F%8E/id427597421?mt=8');
				} else if (ua == 8) {
					$(".jsHXload").attr('href', 'https://down-update.qq.com/qqreaderhb2017/apksource/HXReader.apk');
				}
			}


			// 关系和联系的繁体区分
			$("#ywLgUl").click(function () {
				setTimeout(function () {
					trans();
				}, 10);
			});
			setTimeout(function () {
				trans();
			}, 5000);

			function trans() {
				var text = $("body").text();
				if (text && /聯係/.test(text)) {
					for (var i = 0; i < $(".jsContact").length; i++) {
						$(".jsContact").eq(i).text($(".jsContact").eq(i).text().replace(/聯係/g, '聯繫'));
					}
				} else if (text && /联繫/.test(text)) {
					for (var i = 0; i < $(".jsContact").length; i++) {
						$(".jsContact").eq(i).text($(".jsContact").eq(i).text().replace(/联繫/g, '联系'));
					}
				}
			};
			// footer底部联系我们
			var jsContactDl = $(".jsContactLi dl");
			jsContactDl.on('mouseenter', function () {
				$(".jsContactBox").removeClass('active');
				var index = this.index;
				$(this).find('.jsContactBox').addClass('active');
			}).on('mouseleave', function () {
				$(".jsContactBox").removeClass('active');
			});

			// 键盘按下esc键的时候也能关闭弹窗
			$(document).keydown(function (event) {
				if (event.keyCode == 27) {
					$('#ywOverlay').trigger('click');
					$(".jsShut").trigger('click');
				}
			});
			if (win.SIZE == 'S') {
				// app端的时候帮助中心的链接改变
				var jsQqread = $(".jsQqread");
				if (jsQqread) {
					jsQqread.attr('title', 'QQ阅读书城');
					jsQqread.html('<dd class="yw-kefu-dd">' + 'QQ阅读书城' + '</dd>');
					$(".jsQqreadM").html('QQ阅读书城');
					$(".jsQqreadM").attr('title', 'QQ阅读书城');
					$(".jsQqreadM").attr('href', $(".jsQqreadM").attr('data-href'));
				}
				$(".jsKefuHref a").click(function () {
					$(this).attr('href', $(this).attr('data-href'));
				});

			}
			// 客户端h5隐藏banner图
			if ($('.jsKefuPic').length) {
				$('.jsKefuPic').hide();
			}
			if ($("#ywKfHeader").length) {
				$(".jsKfFocus").attr('href', 'javascript:');
				$(".jsKfFocus").click(function () {
					$("#ywOverlay").show();
					$("#ywOverlay").find('div').html('<img src=' + $(".jsKfFocus").attr('data-href') + ' class="yw-kefu-wx-pic"/>');
				});
				$("#ywOverlay").click(function () {
					$("#ywOverlay").hide();
				});
			}
			return self;

		}


	};

	return exports;
})(document, window);