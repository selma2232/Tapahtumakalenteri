<?php get_header(); ?>

<div class="container">
    <h2 class="title" style="font-size: 35px;"><?php _e( 'Create New Event', 'selma' ); ?></h2>
    <form id="create-event-form" class="form">
        <label>
            <?php _e( 'Title:', 'selma' ); ?>
            <input type="text" id="title" required class="input">
        </label>
        <label>
            <?php _e( 'Description:', 'selma' ); ?>
            <textarea id="description" required class="textarea"></textarea>
        </label>
        <div>
            <h4 class="subtitle"><?php _e( 'Time Options:', 'selma' ); ?></h4>
            <div id="time-options-container">
                <div class="time-option">
                    <input type="datetime-local" class="input" required>
                    <button type="button" class="remove-button" onclick="removeTimeOption(this)">❌</button>
                </div>
            </div>
            <button type="button" onclick="addTimeOption()">
                <?php _e( '+ Add Time Option', 'selma' ); ?>
            </button>
        </div>
        <button type="submit">
            <?php _e( 'Create Event', 'selma' ); ?>
        </button>
    </form>
    <div id="error-message" class="error-message" style="display:none;"></div>
    <div id="event-link" class="event-link" style="display:none;">
        <strong><?php _e( 'Share this link with participants:', 'selma' ); ?></strong>
        <p><a id="event-link-url" href="" target="_blank"></a></p>
    </div>
</div>        

<?php get_footer(); ?>