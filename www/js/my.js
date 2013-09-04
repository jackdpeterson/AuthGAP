var gatewayURL = 'http://wos.jackpeterson.info';

/**
 * AUTH GAP code
 */

document.addEventListener("deviceready", init(), true);

$(document).ready(function() {
	$('#login_sign_in_button').bind('tap', login_action_sign_in);
	$('#auth_index_logout_button').bind('tap', index_action_logout);

});

function init() {
	// modify_views_based_on_authentication_status();
}

/**
 * index_action_logout
 */
function index_action_logout(e) {
	window.localStorage.removeItem("is_authenticated");
	modify_views_based_on_authentication_status();
	return false;
}

function getAuthenticationToken() {
	var email = window.localStorage.getItem("authentication_email");
	var password = window.localStorage.getItem("authentication_password");
	return Base64.encode(Base64.encode(email) + ":" + password);
}

/**
 * login_action_sign_in
 */
function login_action_sign_in(e) {
	var request = null;

	var request = $.ajax({
		type : "POST",
		url : gatewayURL + "/login",
		dataType : 'json',
		data : {
			'email' : $('#login_email_text_input').val(),
			'password' : $('#login_password_text_input').val(),
		},
	});
	request.done(function(msg) {
		if (msg.status == 'authenticated') {
			window.localStorage.setItem("authentication_email", $(
					'#login_email_text_input').val());
			window.localStorage.setItem("authentication_password", $(
					'#login_password_text_input').val());
			window.localStorage.setItem("is_authenticated", 1);
			window.parent.location.href = "#page1";
			modify_views_based_on_authentication_status();
		} else {
			$('#login_error_message').css("display", "block");
			$('#login_error_message p').text(msg.status);
		}

	});
	request.fail(function(jqXHR, textStatus) {
		alert("Login failed: " + textStatus);
	});
	return false;
}

function modify_views_based_on_authentication_status() {
	if (typeof window.localStorage.getItem("is_authenticated") == 'undefined'
			|| window.localStorage.getItem("is_authenticated") == null) {
		// Hide a[id^='auth'] items.
		$("[id^='auth'").css("display", "none");
		// Show a[id^='no_auth'] items.
		$("[id^='no_auth'").css("display", "block");
	}
	// Logged in
	else {
		// Display a[id^='auth'] items.
		$("[id^='auth'").css("display", "block");
		// Hide a[id^='no_auth'] items.
		$("[id^='no_auth'").css("display", "none");

	}
}

/**
 * END OF AUTHGAP code.
 */

// TabBar support
(function($) {
	$.widget('mobile.tabbar', $.mobile.navbar, {
		_create : function() {
			// Set the theme before we call the prototype, which will
			// ensure buttonMarkup() correctly grabs the inheritied theme.
			// We default to the "a" swatch if none is found
			var theme = this.element.jqmData('theme') || "a";
			this.element.addClass('ui-footer ui-footer-fixed ui-bar-' + theme);

			// Make sure the page has padding added to it to account for the
			// fixed bar
			this.element.closest('[data-role="page"]').addClass(
					'ui-page-footer-fixed');

			// Call the NavBar _create prototype
			$.mobile.navbar.prototype._create.call(this);
		},

		// Set the active URL for the Tab Bar, and highlight that button on the
		// bar
		setActive : function(url) {
			// Sometimes the active state isn't properly cleared, so we reset it
			// ourselves
			this.element.find('a')
					.removeClass('ui-btn-active ui-state-persist');
			this.element.find('a[href="' + url + '"]').addClass(
					'ui-btn-active ui-state-persist');
		}
	});

	$(document).bind('pagecreate create', function(e) {
		return $(e.target).find(":jqmData(role='tabbar')").tabbar();
	});

	$(":jqmData(role='page')").live('pageshow', function(e) {
		// Grab the id of the page that's showing, and select it on the Tab Bar
		// on the page
		var tabBar, id = $(e.target).attr('id');

		tabBar = $.mobile.activePage.find(':jqmData(role="tabbar")');
		if (tabBar.length) {
			tabBar.tabbar('setActive', '#' + id);
		}
	});

	var attachEvents = function() {
		var hoverDelay = $.mobile.buttonMarkup.hoverDelay, hov, foc;

		$(document)
				.bind(
						{
							"vmousedown vmousecancel vmouseup vmouseover vmouseout focus blur scrollstart" : function(
									event) {
								var theme, $btn = $(closestEnabledButton(event.target)), evt = event.type;

								if ($btn.length) {
									theme = $btn.attr("data-" + $.mobile.ns
											+ "theme");

									if (evt === "vmousedown") {
										if ($.support.touch) {
											hov = setTimeout(
													function() {
														$btn
																.removeClass(
																		"ui-btn-up-"
																				+ theme)
																.addClass(
																		"ui-btn-down-"
																				+ theme);
													}, hoverDelay);
										} else {
											$btn.removeClass(
													"ui-btn-up-" + theme)
													.addClass(
															"ui-btn-down-"
																	+ theme);
										}
									} else if (evt === "vmousecancel"
											|| evt === "vmouseup") {
										$btn
												.removeClass(
														"ui-btn-down-" + theme)
												.addClass("ui-btn-up-" + theme);
									} else if (evt === "vmouseover"
											|| evt === "focus") {
										if ($.support.touch) {
											foc = setTimeout(
													function() {
														$btn
																.removeClass(
																		"ui-btn-up-"
																				+ theme)
																.addClass(
																		"ui-btn-hover-"
																				+ theme);
													}, hoverDelay);
										} else {
											$btn.removeClass(
													"ui-btn-up-" + theme)
													.addClass(
															"ui-btn-hover-"
																	+ theme);
										}
									} else if (evt === "vmouseout"
											|| evt === "blur"
											|| evt === "scrollstart") {
										$btn.removeClass(
												"ui-btn-hover-" + theme
														+ " ui-btn-down-"
														+ theme).addClass(
												"ui-btn-up-" + theme);
										if (hov) {
											clearTimeout(hov);
										}
										if (foc) {
											clearTimeout(foc);
										}
									}
								}
							},
							"focusin focus" : function(event) {
								$(closestEnabledButton(event.target)).addClass(
										$.mobile.focusClass);
							},
							"focusout blur" : function(event) {
								$(closestEnabledButton(event.target))
										.removeClass($.mobile.focusClass);
							}
						});

		attachEvents = null;
	};

	$.fn.buttonMarkup = function(options) {
		var $workingSet = this;

		// Enforce options to be of type string
		options = (options && ($.type(options) == "object")) ? options : {};
		for ( var i = 0; i < $workingSet.length; i++) {
			var el = $workingSet.eq(i), e = el[0], o = $
					.extend(
							{},
							$.fn.buttonMarkup.defaults,
							{
								icon : options.icon !== undefined ? options.icon
										: el.jqmData("icon"),
								iconpos : options.iconpos !== undefined ? options.iconpos
										: el.jqmData("iconpos"),
								theme : options.theme !== undefined ? options.theme
										: el.jqmData("theme")
												|| $.mobile.getInheritedTheme(
														el, "c"),
								inline : options.inline !== undefined ? options.inline
										: el.jqmData("inline"),
								shadow : options.shadow !== undefined ? options.shadow
										: el.jqmData("shadow"),
								corners : options.corners !== undefined ? options.corners
										: el.jqmData("corners"),
								iconshadow : options.iconshadow !== undefined ? options.iconshadow
										: el.jqmData("iconshadow"),
								iconsize : options.iconsize !== undefined ? options.iconsize
										: el.jqmData("iconsize"),
								mini : options.mini !== undefined ? options.mini
										: el.jqmData("mini")
							}, options),

			// Classes Defined
			innerClass = "ui-btn-inner", textClass = "ui-btn-text", buttonClass, iconClass,
			// Button inner markup
			buttonInner, buttonText, buttonIcon, buttonElements;

			$.each(o, function(key, value) {
				e.setAttribute("data-" + $.mobile.ns + key, value);
				el.jqmData(key, value);
			});

			// Check if this element is already enhanced
			buttonElements = $
					.data(
							((e.tagName === "INPUT" || e.tagName === "BUTTON") ? e.parentNode
									: e), "buttonElements");

			if (buttonElements) {
				e = buttonElements.outer;
				el = $(e);
				buttonInner = buttonElements.inner;
				buttonText = buttonElements.text;
				// We will recreate this icon below
				$(buttonElements.icon).remove();
				buttonElements.icon = null;
			} else {
				buttonInner = document.createElement(o.wrapperEls);
				buttonText = document.createElement(o.wrapperEls);
			}
			buttonIcon = o.icon ? document.createElement("span") : null;

			if (attachEvents && !buttonElements) {
				attachEvents();
			}

			// if not, try to find closest theme container
			if (!o.theme) {
				o.theme = $.mobile.getInheritedTheme(el, "c");
			}

			buttonClass = "ui-btn ui-btn-up-" + o.theme;
			buttonClass += o.inline ? " ui-btn-inline" : "";
			buttonClass += o.shadow ? " ui-shadow" : "";
			buttonClass += o.corners ? " ui-btn-corner-all" : "";

			if (o.mini !== undefined) {
				// Used to control styling in headers/footers, where buttons
				// default to `mini` style.
				buttonClass += o.mini ? " ui-mini" : " ui-fullsize";
			}

			if (o.inline !== undefined) {
				// Used to control styling in headers/footers, where buttons
				// default to `mini` style.
				buttonClass += o.inline === false ? " ui-btn-block"
						: " ui-btn-inline";
			}

			if (o.icon) {
				o.icon = "ui-icon-" + o.icon;
				o.iconpos = o.iconpos || "left";

				iconClass = "ui-icon " + o.icon;

				if (o.iconshadow) {
					iconClass += " ui-icon-shadow";
				}

				if (o.iconsize) {
					iconClass += " ui-iconsize-" + o.iconsize;
				}
			}

			if (o.iconpos) {
				buttonClass += " ui-btn-icon-" + o.iconpos;

				if (o.iconpos == "notext" && !el.attr("title")) {
					el.attr("title", el.getEncodedText());
				}
			}

			innerClass += o.corners ? " ui-btn-corner-all" : "";

			if (o.iconpos && o.iconpos === "notext" && !el.attr("title")) {
				el.attr("title", el.getEncodedText());
			}

			if (buttonElements) {
				el.removeClass(buttonElements.bcls || "");
			}
			el.removeClass("ui-link").addClass(buttonClass);

			buttonInner.className = innerClass;

			buttonText.className = textClass;
			if (!buttonElements) {
				buttonInner.appendChild(buttonText);
			}
			if (buttonIcon) {
				buttonIcon.className = iconClass;
				if (!(buttonElements && buttonElements.icon)) {
					buttonIcon.appendChild(document.createTextNode("\u00a0"));
					buttonInner.appendChild(buttonIcon);
				}
			}

			while (e.firstChild && !buttonElements) {
				buttonText.appendChild(e.firstChild);
			}

			if (!buttonElements) {
				e.appendChild(buttonInner);
			}

			// Assign a structure containing the elements of this button to the
			// elements of this button. This
			// will allow us to recognize this as an already-enhanced button in
			// future calls to buttonMarkup().
			buttonElements = {
				bcls : buttonClass,
				outer : e,
				inner : buttonInner,
				text : buttonText,
				icon : buttonIcon
			};

			$.data(e, 'buttonElements', buttonElements);
			$.data(buttonInner, 'buttonElements', buttonElements);
			$.data(buttonText, 'buttonElements', buttonElements);
			if (buttonIcon) {
				$.data(buttonIcon, 'buttonElements', buttonElements);
			}
		}

		return this;
	};

	$.fn.buttonMarkup.defaults = {
		corners : true,
		shadow : true,
		iconshadow : true,
		iconsize : 18,
		wrapperEls : "span"
	};

	function closestEnabledButton(element) {
		var cname;

		while (element) {
			// Note that we check for typeof className below because the element
			// we
			// handed could be in an SVG DOM where className on SVG elements is
			// defined to
			// be of a different type (SVGAnimatedString). We only operate on
			// HTML DOM
			// elements, so we look for plain "string".
			cname = (typeof element.className === 'string')
					&& (element.className + ' ');
			if (cname && cname.indexOf("ui-btn ") > -1
					&& cname.indexOf("ui-disabled ") < 0) {
				break;
			}

			element = element.parentNode;
		}

		return element;
	}

	jQuery.support.cors = true;

})(jQuery);

// // Zend App GUI EDITOR doesn't appear to have a way to include separate JS
// files... this will become a problem as this JS file becomes HUGE.

/**
 *
 * Base64 encode / decode http://www.webtoolkit.info/
 *
 */

var Base64 = {

	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function(input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output + this._keyStr.charAt(enc1)
					+ this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3)
					+ this._keyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	decode : function(input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = Base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";

		for ( var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function(utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while (i < utftext.length) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12)
						| ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}

};