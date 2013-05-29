function validate(elements) {
    var result = true;
    _.each(elements, function( element ){
        var el = this.$(element)
        if(el.val().length == 0) {
            el.addClass('error');
            result = false;
        } else {
            el.removeClass('error');
        }
    });
    return result;
}

//TODO: more generic handling of error messages
function clearMessage() {
    $("#message").empty();
}

function displayMessage(message) {
    clearNotification();
    clearMessage();
    $("#message").append(message);
}

var notice;

function clearNotification() {

    new EmptyView();

}

/*<!-- Error -->
<div class="notice error"><i class="icon-remove-sign icon-large"></i> This is an Error Notice 
<a href="#close" class="icon-remove"></a></div>

<!-- Warning -->
<div class="notice warning"><i class="icon-warning-sign icon-large"></i> This is a Warning Notice 
<a href="#close" class="icon-remove"></a></div>

<!-- Success -->
<div class="notice success"><i class="icon-ok icon-large"></i> This is a Success Notice 
<a href="#close" class="icon-remove"></a></div>*/
function displaySuccess(message) {
	
	new NotificationView({
					type: 'success',
					icon: 'ok',
					text: message
				});
}

function displayWarning(message) {
	new NotificationView({
					type: 'warning',
					icon: 'warning',
					text: message
				});	
}

function displayError(message) {
	
	new NotificationView({
					type: 'error',
					icon: 'remove',
					text: message
				});
}

String.prototype.endsWith = function(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
};

tpl = {
 
    // Hash of preloaded templates for the app
    templates:{},
 
    // Recursively pre-load all the templates for the app.
    // This implementation should be changed in a production environment. All the template files should be
    // concatenated in a single file.
    loadTemplates:function (names, callback) {
 
        var that = this;
 
        var loadTemplate = function (index) {
            var name = names[index];
            console.log('Loading template: ' + name);

            $.get('templates/' + name + '.html', function (data) {
                that.templates[name] = data;
                index++;
                if (index < names.length) {
                    loadTemplate(index);
                } else {
                    callback();
                }
            });
        }
 
        loadTemplate(0);
    },
 
    // Get template by name from hash of preloaded templates
    get:function (name) {
        return this.templates[name];
    }
 
};
