<?php
/**
 * Widget API: WP_Widget_Media_Image class
 *
 * @package ClassicPress
 * @subpackage Widgets
 * @since CP-2.3.0
 */

/**
 * Core class that implements an image widget.
 *
 * @since 4.8.0
 * @since CP-2.3.0
 *
 * Rebuilt to use PHP instead of JavaScript templates.
 *
 * @see WP_Widget
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
	}

	/**
	 * Front-end display of widget.
	 *
	 * @since CP-2.3.0
	 *
	 * @see WP_Widget::widget()
	 *
	 * @param array $args     Widget arguments.
	 * @param array $instance Saved values from database.
	 */
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

	/**
	 * Back-end widget form.
	 *
	 * @since CP-2.3.0
	 *
	 * @see WP_Widget::form()
	 *
	 * @param array $instance Previously saved values from database.
	 */
    public function form( $instance ) {
        $title     = ! empty( $instance['title'] ) ? $instance['title'] : '';
        $image_id  = ! empty( $instance['image_id'] ) ? $instance['image_id'] : 0;
        $size      = ! empty( $instance['size'] ) ? $instance['size'] : 'full';
        $link_type = ! empty( $instance['link_type'] ) ? $instance['link_type'] : '';
        $link_url  = ! empty( $instance['link_url'] ) ? $instance['link_url'] : '';
        $caption   = ! empty( $instance['caption'] ) ? $instance['caption'] : '';
        $alt_text  = ! empty( $instance['alt_text'] ) ? $instance['alt_text'] : '';
        ?>

		<div class="media-widget-control">
			<fieldset>
				<label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php esc_html_e( 'Title:' ); ?></label>
				<input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
 
				<input class="widefat" id="<?php echo $this->get_field_id( 'image_id' ); ?>" name="<?php echo $this->get_field_name( 'image_id' ); ?>" type="hidden" data-property="image_id" value="<?php echo esc_attr( $image_id ); ?>">
			</fieldset>

			<fieldset>
				<div class="media-widget-preview media_image">

					<?php
					if ( $image_id ) {
						$raw_image = wp_get_attachment_image( $image_id, 'thumbnail' );
						echo preg_replace( '~(height|width)="\d*"\s~', '', $raw_image );
					}
					?>

				</div>
						
				<?php
				if ( $image_id ) {
				?>

					<div class="media-widget-buttons">
						<button type="button" class="button edit-media"><?php esc_html_e( 'Edit Image' ); ?></button>
						<button type="button" class="button change-media select-media"><?php esc_html_e( 'Replace Image' ); ?></button>
					</div>

				<?php
				} else {
				?>

					<div class="attachment-media-view">
						<button type="button" class="select-media button-add-media"><?php esc_html_e( 'Add Image' ); ?></button>
					</div>

				<?php
				}
				?>

			</fieldset>

			<fieldset>
				<label for="<?php echo $this->get_field_id('size'); ?>"><?php esc_html_e( 'Size:' ); ?></label>
				<select class="widefat" id="<?php echo $this->get_field_id('size'); ?>" name="<?php echo $this->get_field_name('size'); ?>">

					<?php
					$sizes = get_intermediate_image_sizes();
					foreach ( $sizes as $size_option ) {
						if ( in_array( $size_option, array( '1536x1536', '2048x2048' ), true ) ) {
							continue;
						}
						echo '<option value="' . esc_attr( $size_option ) . '"' . selected( $size, $size_option, false ) . '>' . esc_html( ucfirst( $size_option ) ) . '</option>';
					}
					?>

				</select>
			</fieldset>

			<fieldset>
				<label for="<?php echo $this->get_field_id( 'link_type' ); ?>"><?php esc_html_e( 'Link To:' ); ?></label>
				<select class="widefat" id="<?php echo $this->get_field_id( 'link_type' ); ?>" name="<?php echo $this->get_field_name( 'link_type' ); ?>">
					<option value="" <?php selected( $link_type, '' ); ?>><?php esc_html_e( 'None' ); ?></option>
					<option value="file" <?php selected( $link_type, 'file' ); ?>><?php esc_html_e( 'Media File' ); ?></option>
					<option value="custom" <?php selected( $link_type, 'custom' ); ?>><?php esc_html_e( 'Custom URL' ); ?></option>
				</select>
			</fieldset>

			<fieldset>
				<label for="<?php echo $this->get_field_id( 'link_url' ); ?>"><?php esc_html_e( 'Custom URL:' ); ?></label>
				<input class="widefat" id="<?php echo $this->get_field_id( 'link_url' ); ?>" name="<?php echo $this->get_field_name( 'link_url' ); ?>" type="text" value="<?php echo esc_attr( $link_url ); ?>">
			</fieldset>

			<fieldset>
				<label for="<?php echo $this->get_field_id( 'caption' ); ?>"><?php esc_html_e( 'Caption:' ); ?></label>
				<textarea class="widefat" id="<?php echo $this->get_field_id( 'caption' ); ?>" name="<?php echo $this->get_field_name( 'caption' ); ?>"><?php echo esc_textarea( $caption ); ?></textarea>
			</fieldset>

			<fieldset>
				<label for="<?php echo $this->get_field_id( 'alt_text' ); ?>"><?php esc_html_e( 'Alt Text:' ); ?></label>
				<input class="widefat" id="<?php echo $this->get_field_id( 'alt_text' ); ?>" name="<?php echo $this->get_field_name( 'alt_text' ); ?>" type="text" value="<?php echo esc_attr( $alt_text ); ?>">
			</fieldset>
		</div>

		<?php
	}

	/**
	 * Sanitize widget form values as they are saved.
	 *
	 * @since CP-2.3.0
	 *
	 * @see WP_Widget::update()
	 *
	 * @param array $new_instance Values just sent to be saved.
	 * @param array $old_instance Previously saved values from database.
	 *
	 * @return array Updated safe values to be saved.
	 */
    public function update( $new_instance, $old_instance ) {
        $instance = array();
        $instance['title']     = ( ! empty( $new_instance['title'] ) ) ? sanitize_text_field( $new_instance['title'] ) : '';
        $instance['image_id']  = ( ! empty( $new_instance['image_id'] ) ) ? absint( $new_instance['image_id'] ) : 0;
        $instance['size']      = ( ! empty( $new_instance['size'] ) ) ? sanitize_text_field( $new_instance['size'] ) : 'full';
        $instance['link_type'] = ( ! empty( $new_instance['link_type'] ) ) ? sanitize_text_field( $new_instance['link_type'] ) : '';
        $instance['link_url']  = ( ! empty( $new_instance['link_url'] ) ) ? sanitize_url( $new_instance['link_url'] ) : '';
        $instance['caption']   = ( ! empty( $new_instance['caption'] ) ) ? wp_kses_post( $new_instance['caption'] ) : '';
        $instance['alt_text']  = ( ! empty( $new_instance['alt_text'] ) ) ? sanitize_text_field( $new_instance['alt_text'] ) : '';
        return $instance;
    }
}
