(function( $ ){
  
  // used to generate unique IDs
  var padCount = window.__padCount = 0;
      
  /**
   * Performs AJAX calls to retreive the HTML content of a pad
   * and puts it into a target
   */
  function fetchHTML(frameUrl, $target, cb) {
    var contentsUrl = frameUrl + "/export/html";
//    var rawContentsUrl = frameUrl + "/export/html?raw";
    
    $.get(contentsUrl, function(data) {
      var html = data;
      if ($target[0].nodeName.toLowerCase() == 'textarea') {
        $target.val(html);
      }
      else {
        $target.html(html);
      }
    });
  }
  
  $.fn.pad = function( options ) {
    var settings = {
      'host'              : 'http://beta.etherpad.org',
      'baseUrl'           : '/p/',
      'showControls'      : false,
      'showChat'          : false,
      'showLineNumbers'   : false,
      'userName'          : 'unnamed',
      'useMonospaceFont'  : false,
      'noColors'          : false,
      'hideQRCode'        : false,
      'width'             : 100,
      'height'            : 100,
      'border'            : 0,
      'borderStyle'       : 'solid',
      'toggleTextOn'      : 'Disable Rich-text',
      'toggleTextOff'     : 'Enable Rich-text',
      
      'poll'              : 3000
    };
    
    var $self = this;
    if (!$self.length) return;
    
    options = options || (options = {});
    $.extend( settings, options );
    if (console) console.info('Settings', settings);
    
    if (options.parse) {
      var context = (typeof options.parse != 'object' ? $('body')[0] : options.parse);
      
      $('[data-pad-id]:not(.etherpad-lite-processed)')
        .addClass('etherpad-lite-processed')
        .each(function(){
          var $display = $(this);
          fetchHTML($display.attr('rel'), $display);
          if (settings.poll > 500) {
            $display
              .data('pad-polling', setInterval(function(){
                fetchHTML($display.attr('rel'), $display);
              }, settings.poll))
              .hover(function(){
                $display.css('background-color', '#eee');
                clearInterval($display.data('pad-polling'));
              }, function(){
                $display
                  .css('background-color', 'transparent')
                  .data('pad-polling', setInterval(function(){
                    fetchHTML($display.attr('rel'), $display);
                  }, settings.poll))
                ;
              })
            ;
          }
        })
      ;
      return;
    }
    
    
    if (!$self.attr('id')) {
      $self.attr('id', 'pad-'+ padCount);
      padCount++;
    }
    
    var useValue = $self[0].tagName.toLowerCase() == 'textarea';
    var selfId = $self.attr('id');
    var epframeId = 'epframe'+ selfId;
    var frameExists = $('#'+ epframeId).length;

    if ( !options.getContents ) {
//      $.extend( settings, options );
      
      // This writes a new frame if required
      if (!frameExists) {
        var iFrame = '<iframe id="'+epframeId;
            iFrame = iFrame +'" name="'+epframeId;
            iFrame = iFrame +'" src="'+settings.host+settings.baseUrl+settings.padId;
            iFrame = iFrame + '?showControls='+settings.showControls;
            iFrame = iFrame + '&showChat='+settings.showChat;
            iFrame = iFrame + '&showLineNumbers='+settings.showLineNumbers;
            iFrame = iFrame + '&useMonospaceFont='+settings.useMonospaceFont;
            iFrame = iFrame + '&userName=' + settings.userName;
            iFrame = iFrame + '&noColors=' + settings.noColors;
            iFrame = iFrame + '&hideQRCode=' + settings.hideQRCode;
            iFrame = iFrame +'" style="border:'+settings.border;
            iFrame = iFrame +'; border-style:'+settings.borderStyle;
//            iFrame = iFrame +'; width:'+settings.width;
//            iFrame = iFrame +'; height:'+settings.height;
            iFrame = iFrame +';" width="'+ '100%';//settings.width;
            iFrame = iFrame +'" height="'+ settings.height; 
            iFrame = iFrame +'"></iframe>';
        
        if (useValue) {
          $self.after(iFrame);
        }
        else {
          $self.html(iFrame);
        }
      }
      
      var $iFrame = $('#'+ epframeId);

      if (useValue) {

        if (!$('#'+ selfId +'-toggle').length) {
          var $toggleLink = $('<a href="#'+ selfId +'" id="'+ selfId +'-toggle">'+ settings.toggleTextOn +'</a>').click(function(){
            var $this = $(this);
            $this.toggleClass('active');
            if ($this.hasClass('active')) $this.text(settings.toggleTextOff);
            $self.pad({
              getContents: true,
              returnValue: true
            });
            return false;
          });
        
          $self.after($toggleLink);
        }
        
        $self.hide();
        
      }
      else {      
        $self.html(iFrame);
      }
    }

    // This reads the etherpad contents if required
    else {
      var $frame = $('#'+ epframeId).attr('src');
      if (!$frame) return;
      fetchHTML($frame.split('?')[0], $self);
    }
    
    if (settings.destroy) {
      $self.show();
      $('#'+ epframeId).remove();
      $('#'+ selfId +'-toggle').remove();
    }
    
    return $self;
  };
})( jQuery );
