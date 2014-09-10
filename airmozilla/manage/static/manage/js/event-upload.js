/* When you upload a file, you might be doing it from the Event Request
   wizard or you might be doing it from the management.
   Because we're reusing much of the code in uploads/static/js/upload.js
   we need a way to distinguish the management upload from regular mortal
   upload.

   In this hook, by merely existing in the global window object, we take
   the opportunity to see if they clicked the ``#id_automate_vidly_submission`
   checkbox then we try to automate all the remaining steps by calling the
   necessary functions with AJAX posts.
 */

function postSaveHook(response) {
    if ($('#id_automate_vidly_submission:checked').length) {
        // now let's automate all the necessary steps to submit this
        // to Vid.ly
        var form = $('form#upload');
        $('.automation-progress').show();
        var progress = $('#automation-progressbar');
        var progress_bar = $('progress', progress);
        progress_bar.attr('value', 50);
        var progress_value = $('.progress-value', progress);
        progress_value.text('50 %');
        progress.show();

        var data = form.data('vidly-submit-details');
        data.url = response.url;
        data.csrfmiddlewaretoken = $('input[name="csrfmiddlewaretoken"]', form).val();
        $.post(form.data('vidly-shortcut-url'), data)
        .success(function(response) {
            progress_bar.attr('value', 100);
            progress_value.text('100 %');
            data = form.data('event-archive-details');
            data.template_environment = 'file=' + response.shortcode;
            data.csrfmiddlewaretoken = $('input[name="csrfmiddlewaretoken"]', form).val();
            $.post(form.data('event-archive-url'), data)
            .success(function(response) {
                setTimeout(function() {
                    progress.hide();
                }, 500);
                $('.automation-progress .pre-automation').hide();
                $('.automation-progress .post-automation').show();
                $('.post-save').hide();
            })
            .fail(function() {
                console.warn('Unable archive event with shortcode');
                console.error(arguments);
                progress.hide();
            });
        })
        .fail(function() {
            console.warn('Unable get vid.ly shortcode');
            console.error(arguments);
            progress.hide();
        });
    }
}