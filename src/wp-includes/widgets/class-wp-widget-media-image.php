<?php
/**
 * Adds Image widget.
 */
class WP_Widget_Media_Image extends WP_Widget {
/**
	 * Constructor.
	 *
	 * @since 4.8.0
	 */
	public function __construct() {
		parent::__construct(
			'media_image',
			__( 'Image' ),
			array(
				'description' => __( 'Displays an image.' ),
				'mime_type'   => 'image',
			)
		);
/* 
 * DO NOT DELETE 
 * $this->l10n needs updating to avoid errors
 * 
		$this->l10n = array_merge(
			$this->l10n,
			array(
				'no_media_selected'          => __( 'No image selected' ),
				'add_media'                  => _x( 'Add Image', 'label for button in the image widget' ),
				'replace_media'              => _x( 'Replace Image', 'label for button in the image widget; should preferably not be longer than ~13 characters long' ),
				'edit_media'                 => _x( 'Edit Image', 'label for button in the image widget; should preferably not be longer than ~13 characters long' ),
				'missing_attachment'         => sprintf(
					/* translators: %s: URL to media library. *
					__( 'That image cannot be found. Check your <a href="%s">media library</a> and make sure it was not deleted.' ),
					esc_url( admin_url( 'upload.php' ) )
				),
				/* translators: %d: Widget count. *
				'media_library_state_multi'  => _n_noop( 'Image Widget (%d)', 'Image Widget (%d)' ),
				'media_library_state_single' => __( 'Image Widget' ),
			)
		);
*/	}

    public function widget( $args, $instance ) {
        echo $args['before_widget'];

        $title     = ! empty( $instance['title'] ) ? apply_filters( 'widget_title', $instance['title'] ) : '';
        $image_id  = ! empty( $instance['image_id'] ) ? $instance['image_id'] : 0;
        $size      = ! empty( $instance['size'] ) ? $instance['size'] : 'full';
        $link_type = ! empty( $instance['link_type'] ) ? $instance['link_type'] : '';
        $link_url  = ! empty( $instance['link_url'] ) ? $instance['link_url'] : '';
        $caption   = ! empty( $instance['caption'] ) ? $instance['caption'] : '';
        $alt_text  = ! empty( $instance['alt_text'] ) ? $instance['alt_text'] : '';

        if ( ! empty( $title ) ) {
            echo $args['before_title'] . $title . $args['after_title'];
        }

        if ( $image_id ) {
            $image_html = wp_get_attachment_image( $image_id, $size, false, array( 'alt' => $alt_text ) );
            
            if ( $link_type === 'custom' && ! empty( $link_url ) ) {
                $image_html = '<a href="' . esc_url( $link_url ) . '">' . $image_html . '</a>';
            } elseif ( $link_type === 'file' ) {
                $file_url = wp_get_attachment_url( $image_id );
                $image_html = '<a href="' . esc_url( $file_url ) . '">' . $image_html . '</a>';
            }

            if ( ! empty( $caption ) ) {
                $image_html = '<figure>' . $image_html . '<figcaption>' . esc_html( $caption ) . '</figcaption></figure>';
            }

            echo $image_html;
        }

        echo $args['after_widget'];
    }

    public function form( $instance ) {
        $title     = ! empty( $instance['title'] ) ? $instance['title'] : '';
        $image_id  = ! empty( $instance['image_id'] ) ? $instance['image_id'] : 0;
        $size      = ! empty( $instance['size'] ) ? $instance['size'] : 'full';
        $link_type = ! empty( $instance['link_type'] ) ? $instance['link_type'] : '';
        $link_url  = ! empty( $instance['link_url'] ) ? $instance['link_url'] : '';
        $caption   = ! empty( $instance['caption'] ) ? $instance['caption'] : '';
        $alt_text  = ! empty( $instance['alt_text'] ) ? $instance['alt_text'] : '';

        ?>
        <p>
            <label for="<?php echo $this->get_field_id( 'title' ); ?>">Title:</label>
            <input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
        </p>
        <div class="media-widget-preview media_image"><?php // gets "populated" added to class when image added ?>
			<div class="attachment-media-view"><?php // replaced with <img class="attachment-thumb" src="http://localhost/tryfile/wp-content/uploads/2024/AWRDS24_Innovations_badge-300x170.png" draggable="false" alt="2024 Innovations in Technology Award Recipient"> when image added ?>
				<button type="button" class="select-media button-add-media not-selected">Add Image</button>
			</div>
		</div>
		<p class="media-widget-buttons">
			<button type="button" class="button edit-media selected">Edit Image</button>
			<button type="button" class="button change-media select-media selected">Replace Image</button>
		</p>
		<div class="media-widget-fields"></div><?php /* populated with the following when image added 
        <p class="media-widget-image-link">
			<label for="el0.5176951584933098_linkUrl">Link to:</label>
			<input id="el0.5176951584933098_linkUrl" type="text" class="widefat link" value="" placeholder="https://" pattern="((\w+:)?\/\/\w.*|\w+:(?!\/\/$)|\/|\?|#).*">
		</p> */ ?>
        <?php
    }

    public function update( $new_instance, $old_instance ) {
        $instance = array();
        $instance['title']     = ( ! empty( $new_instance['title'] ) ) ? sanitize_text_field( $new_instance['title'] ) : '';
        $instance['image_id']  = ( ! empty( $new_instance['image_id'] ) ) ? absint( $new_instance['image_id'] ) : 0;
        $instance['size']      = ( ! empty( $new_instance['size'] ) ) ? sanitize_text_field( $new_instance['size'] ) : 'full';
        $instance['link_type'] = ( ! empty( $new_instance['link_type'] ) ) ? sanitize_text_field( $new_instance['link_type'] ) : '';
        $instance['link_url']  = ( ! empty( $new_instance['link_url'] ) ) ? esc_url_raw( $new_instance['link_url'] ) : '';
        $instance['caption']   = ( ! empty( $new_instance['caption'] ) ) ? wp_kses_post( $new_instance['caption'] ) : '';
        $instance['alt_text']  = ( ! empty( $new_instance['alt_text'] ) ) ? sanitize_text_field( $new_instance['alt_text'] ) : '';

        return $instance;
    }
}
