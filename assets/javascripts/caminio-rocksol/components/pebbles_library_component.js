( function( App ){

  'use strict';

  App.PebblesLibraryComponent = Ember.Component.extend({

    domainThumbs: currentDomain.preferences.thumbs,

    didInsertElement: function(){

    },

    actions: {
      
      showPebble: function( pebble ){
        var self = this;
        this.set('curPebble', pebble);

        setTimeout( function(){ updatePlugins(pebble, self); }, 100);
      },

      savePebble: function(){
        var self = this;
        var pebble = this.get('curPebble');
        pebble.save().then( function(){
          notify('info', Em.I18n.t('pebble.saved', { name: pebble.get('name') }) );
          updatePlugins( pebble, self );
        });
      },

      saveTeaser: function(){
        var self = this;
        var teaser = this.get('curPebble.teaser');
        teaser.save().then( function(){
          notify('info', Em.I18n.t('pebble.teaser.saved', { name: teaser.get('name') }) );
        });
      },

      cancelClosePebble: function(){
        this.get('curPebble').rollback();
        this.set('curPebble',null);
      }


    }

  });

  function updatePlugins(pebble, self){

    if( pebble.get('type') === 'teaser' )
      setupTeaser( pebble, self );
  }

  function setupTeaser( pebble, comp ){

    var controller = comp.get('controller');

    var uploadOptions = {
      url: '/caminio/mediafiles',
      dataType: 'json',
      done: function (e, data) {
        setTimeout(function(){
          $('#progress').removeClass('active');
        },500);
        App.Mediafile.store.pushPayload( 'mediafile', data.result );
        var teaser = App.Mediafile.store.getById( 'mediafile', data.result.mediafiles[0].id );
        pebble.set('teaser', teaser);
        pebble.save().catch(function(err){
          console.error(err);
          notify.processError( err );
        });
      },
      progressall: function (e, data) {
        $('#progress').addClass('active');
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#progress .progress-bar').css(
          'width',
          progress + '%'
        )
        .attr('aria-valuenow', progress)
        .find('.perc-text').text(progress+'%');
      }
    }

    function onFileUploadSubmit( e, data ){
      data.formData = { parent: controller.get('webpage').id,
                        parentType: 'Webpage' };
    }

    $('#teaserupload').fileupload(uploadOptions)
      .on('fileuploadsubmit', onFileUploadSubmit);

    $('#teaserreplace').fileupload(uploadOptions)
      .on('fileuploadsubmit', onFileUploadSubmit);

    var currentCrop;

    $('.previews').on('click', '.preview-thumb', function(){
      $('.preview-thumb').removeClass('active');
      $(this).addClass('active');
      if( currentCrop )
        currentCrop.destroy();
      var coords = pebble.get('teaser').getThumbDim( $(this).attr('data-size') );
      var cropOptions = {
        onChange: showPreview,
        onSelect: showPreviewAndWriteThumb,
        aspectRatio: $(this).width()/$(this).height()
      };
      if( coords )
        cropOptions.setSelect = [ coords.selX, coords.selY, coords.selX2, coords.selY2 ];
      currentCrop = $.Jcrop('#crop-img', cropOptions);
    });

    $('.previews .preview-thumb').each(function(){
      updatePreviewThumb( $(this), pebble.get('teaser').getThumbDim( $(this).attr('data-size') ) );
    });

    $('.preview-thumb:first').click();

    function showPreviewAndWriteThumb( coords ){
      showPreview(coords);
      var $thumb = $('.preview-thumb.active');

      pebble.get('teaser').setThumbDim( $thumb.attr('data-size'), genCoords($thumb,coords) );
      pebble.get('teaser').save();
    }

  }

  function genCoords($thumb,coords){

    var $img = $('<img style="opacity:0">');
    $img.attr('src', $('#crop-img').attr('src'));
    $('body').append( $img );

    // + 3px per padding (left right)
    var thumbW = ($thumb.width());
    var thumbH = ($thumb.height());

    var x1 = $('#crop-img').width() / $img.width();
    var x2 = thumbW / coords.w;

    var y1 = $('#crop-img').height() / $img.height();
    var y2 = thumbH / coords.h;

    var ratio = x1 * x2;
    //var ratioY = y1 * y2;

    var data = {
      w: Math.round( ratio * $img.width() ),
      h: Math.round( ratio * $img.height() ),
      x: Math.round(x2 * coords.x),
      y: Math.round(x2 * coords.y),
      selX: Math.round(coords.x),
      selY: Math.round(coords.y),
      selX2: Math.round(coords.x2),
      selY2: Math.round(coords.y2),
      cropX: Math.round(x2 * coords.x),
      cropY: Math.round(x2 * coords.y),
      resizeW: Math.round( $('#crop-img').width() * x2 ),
      resizeH: Math.round( $('#crop-img').height() * x2 )
    };
    
    $img.remove();
    return data;
  }

  function showPreview(coords){

    if( coords.w < 10 )
      return;

    var $thumb = $('.preview-thumb.active');
    if( !currentDomain.preferences.thumbs )
      return console.error('no domain.preferences.thumbs settings were found. aborting');
    
    updatePreviewThumb( $thumb,
                        genCoords($thumb,coords));

  }

  function updatePreviewThumb( $thumb, coords ){
    if( !coords )
      return;
    $thumb.find('img').css({
      width: coords.w + 'px',
      height: coords.h + 'px',
      marginLeft: '-' + coords.x + 'px',
      marginTop: '-' + coords.y + 'px'
    });
  }

  App.ThumbsController = Ember.ObjectController.extend({
    genThumbSizes: function(){
      var dim = this.get('content').split('x');
      return "width: "+dim[0]+"px; height: "+dim[1]+"px";
    }.property(),
    genThumbId: function(){
      return "preview-thumb"+this.get('content')+"-img";
    }.property()
  });

})(App);