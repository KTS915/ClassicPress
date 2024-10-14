<?php
/**
 * Widget API: WP_Widget_Media_Image class
 *
 * @package ClassicPress
 * @subpackage Widgets
 *
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
	 * @param array $args	 Widget arguments.
	 * @param array $instance Saved values from database.
	 */
	public function widget( $args, $instance ) {
		echo $args['before_widget'];

		$title         = ! empty( $instance['title'] ) ? apply_filters( 'widget_title', $instance['title'] ) : '';
		$attachment_id = ! empty( $instance['attachment_id'] ) ? $instance['attachment_id'] : 0;
		$size          = ! empty( $instance['size'] ) ? $instance['size'] : 'full';
		$link_type     = ! empty( $instance['link_type'] ) ? $instance['link_type'] : '';
		$link_url      = ! empty( $instance['link_url'] ) ? $instance['link_url'] : '';
		$caption       = ! empty( $instance['caption'] ) ? $instance['caption'] : '';
		$alt_text      = ! empty( $instance['alt_text'] ) ? $instance['alt_text'] : '';
		$url           = ! empty( $instance['url'] ) ? $instance['url'] : '';

		if ( ! empty( $title ) ) {
			echo $args['before_title'] . $title . $args['after_title'];
		}

		if ( $attachment_id || $url ) {
			$image_html = wp_get_attachment_image( $attachment_id, $size, false, array( 'alt' => $alt_text ) );
			
			if ( $attachment_id && $link_type === 'custom' && ! empty( $link_url ) ) {
				$image_html = '<a href="' . esc_url( $link_url ) . '">' . $image_html . '</a>';
			} elseif ( $attachment_id && $link_type === 'file' ) {
				$file_url = wp_get_attachment_url( $attachment_id );
				$image_html = '<a href="' . esc_url( $file_url ) . '">' . $image_html . '</a>';
			} elseif ( $url ) {
				$image_html = '<img src="' . esc_url( $url ) . '" alt="' . esc_attr( $alt_text ) . '">';
				if ( $link_type && $link_type !== 'none' && $link_url ) {
					$image_html = '<a href="' . esc_url( $link_url ) . '">' . $image_html . '</a>';
				}
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
		$title         = ! empty( $instance['title'] ) ? $instance['title'] : '';
		$attachment_id = ! empty( $instance['attachment_id'] ) ? $instance['attachment_id'] : 0;
		$size          = ! empty( $instance['size'] ) ? $instance['size'] : 'full';
		$alt_text      = ! empty( $instance['alt_text'] ) ? $instance['alt_text'] : '';
		$link_type     = ! empty( $instance['link_type'] ) ? $instance['link_type'] : '';
		$link_url      = ! empty( $instance['link_url'] ) ? $instance['link_url'] : '';
		$caption       = ! empty( $instance['caption'] ) ? $instance['caption'] : '';
		$url           = ! empty( $instance['url'] ) ? $instance['url'] : '';
		?>

		<div class="media-widget-control">
			<fieldset>
				<label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php esc_html_e( 'Title:' ); ?></label>
				<input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
			</fieldset>

			<fieldset>
				<div class="media-widget-preview media_image">

					<?php
					$image_html = '';
					if ( $url ) {
						$image_html = '<img class="attachment-thumb size-thumb" src="' . esc_url( $url ) . '" alt="' . esc_attr( $alt_text ) . '">';
					} elseif ( $attachment_id ) {
						$raw_image = wp_get_attachment_image( $attachment_id, 'thumb', false, array( 'alt' => $alt_text ) );
						$image_html = preg_replace( '~(height|width)="\d*"\s~', '', $raw_image );
					}

					if ( ! empty( $caption ) ) {
						$image_html = '<figure>' . $image_html . '<figcaption>' . esc_html( $caption ) . '</figcaption></figure>';
					}

					echo $image_html;
					?>

				</div>
						
				<?php
				if ( $attachment_id || $url ) {
				?>

					<div class="media-widget-buttons">
						<button type="button" class="button edit-media"><?php esc_html_e( 'Edit Image' ); ?></button>
						<button type="button" class="button change-media select-media"><?php esc_html_e( 'Replace Image' ); ?></button>
					</div>

					<?php
					if ( $link_type && $link_type !== 'none' && $link_url ) {
					?>

					<fieldset class="media-widget-image-link">
						<label for="<?php echo $this->get_field_id( 'link_url' ); ?>"><?php esc_html_e( 'Link to:' ); ?></label>
						<input id="<?php echo $this->get_field_id( 'link_url' ); ?>" class="widefat" name="<?php echo $this->get_field_name( 'link_url' ); ?>" type="url" value="<?php echo esc_url( $link_url ); ?>" data-link-url="link_url">
						
						<input id="<?php echo $this->get_field_id( 'link_type' ); ?>" class="widefat" name="<?php echo $this->get_field_name( 'link_type' ); ?>" type="hidden" value="<?php echo esc_attr( $link_type ); ?>" data-link-type="link_type">
					</fieldset>

					<?php
					} else {
					?>

					<fieldset class="media-widget-image-link">
						<input id="<?php echo $this->get_field_id( 'link_type' ); ?>" class="widefat" name="<?php echo $this->get_field_name( 'link_type' ); ?>" type="hidden" value="<?php echo esc_attr( $link_type ); ?>" data-link-type="link_type">
						<input id="<?php echo $this->get_field_id( 'link_url' ); ?>" class="widefat" name="<?php echo $this->get_field_name( 'link_url' ); ?>" type="hidden" value="<?php echo esc_url( $link_url ); ?>" data-link-url="link_url">
					</fieldset>

					<?php
					}
					?>

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

			<div class="widget-content">
				<input class="widefat" id="<?php echo $this->get_field_id( 'attachment_id' ); ?>" name="<?php echo $this->get_field_name( 'attachment_id' ); ?>" type="hidden" data-property="attachment_id" value="<?php echo esc_attr( $attachment_id ); ?>">
				<input class="widefat" id="<?php echo $this->get_field_id('size'); ?>" name="<?php echo $this->get_field_name( 'size' ); ?>" type="hidden" data-property="size">
				<input class="widefat" id="<?php echo $this->get_field_id( 'link_type' ); ?>" name="<?php echo $this->get_field_name( 'link_type' ); ?>" type="hidden" data-property="link_type">
				<input class="widefat" id="<?php echo $this->get_field_id( 'link_url' ); ?>" name="<?php echo $this->get_field_name( 'link_url' ); ?>" type="hidden" data-property="link_url">
				<input class="widefat" id="<?php echo $this->get_field_id( 'caption' ); ?>" name="<?php echo $this->get_field_name( 'caption' ); ?>" type="hidden" data-property="caption">
				<input class="widefat" id="<?php echo $this->get_field_id( 'alt_text' ); ?>" name="<?php echo $this->get_field_name( 'alt_text' ); ?>" type="hidden" data-property="alt_text">
				<input class="widefat" id="<?php echo $this->get_field_id( 'url' ); ?>" name="<?php echo $this->get_field_name( 'url' ); ?>" type="hidden" data-property="url">
			</div>
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
		$instance['title']         = ! empty( $new_instance['title'] ) ? sanitize_text_field( $new_instance['title'] ) : '';
		$instance['attachment_id'] = ! empty( $new_instance['attachment_id'] ) ? absint( $new_instance['attachment_id'] ) : 0;
		$instance['size']          = ! empty( $new_instance['size'] ) ? sanitize_text_field( $new_instance['size'] ) : 'full';
		$instance['link_type']     = ! empty( $new_instance['link_type'] ) ? sanitize_text_field( $new_instance['link_type'] ) : '';
		$instance['link_url']      = ! empty( $new_instance['link_url'] ) ? sanitize_url( $new_instance['link_url'] ) : '';
		$instance['caption']       = ! empty( $new_instance['caption'] ) ? wp_kses_post( $new_instance['caption'] ) : '';
		$instance['alt_text']      = ! empty( $new_instance['alt_text'] ) ? sanitize_text_field( $new_instance['alt_text'] ) : '';
		$instance['url']           = ! empty( $new_instance['url'] ) ? sanitize_url( $new_instance['url'] ) : '';

		return $instance;
	}
}
