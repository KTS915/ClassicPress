<?php
/**
 * Widget API: WP_Widget_Media_Audio class
 *
 * @package ClassicPress
 * @subpackage Widgets
 * @since 4.8.0
 */

/**
 * Core class that implements an audio widget.
 *
 * @since 4.8.0
 * @since CP-2.3.0
 *
 * Rebuilt to use PHP instead of JavaScript templates.
 *
 * @see WP_Widget
 */
class WP_Widget_Media_Audio extends WP_Widget {

	/**
	 * Constructor.
	 *
	 * @since 4.8.0
	 */
	public function __construct() {
		parent::__construct(
			'media_audio',
			__( 'Audio' ),
			array(
				'description' => __( 'Displays an audio player.' ),
				'mime_type'   => 'audio',
			)
		);
/*
		$this->l10n = array_merge(
			$this->l10n,
			array(
				'no_media_selected'		  => __( 'No audio selected' ),
				'add_media'				  => _x( 'Add Audio', 'label for button in the audio widget' ),
				'replace_media'			  => _x( 'Replace Audio', 'label for button in the audio widget; should preferably not be longer than ~13 characters long' ),
				'edit_media'				 => _x( 'Edit Audio', 'label for button in the audio widget; should preferably not be longer than ~13 characters long' ),
				'missing_attachment'		 => sprintf(
					/* translators: %s: URL to media library. *
					__( 'That audio file cannot be found. Check your <a href="%s">media library</a> and make sure it was not deleted.' ),
					esc_url( admin_url( 'upload.php' ) )
				),
				/* translators: %d: Widget count. *
				'media_library_state_multi'  => _n_noop( 'Audio Widget (%d)', 'Audio Widget (%d)' ),
				'media_library_state_single' => __( 'Audio Widget' ),
				'unsupported_file_type'	  => __( 'Looks like this is not the correct kind of file. Please link to an audio file instead.' ),
			)
		);
*/	}


	/**
	 * Front-end display of widget.
	 *
	 * @see WP_Widget::widget()
	 *
	 * @param array $args	 Widget arguments.
	 * @param array $instance Saved values from database.
	 */
	public function widget( $args, $instance ) {
		echo $args['before_widget'];

		$title         = ! empty( $instance['title'] ) ? $instance['title'] : '';
		$attachment_id = ! empty( $instance['attachment_id'] ) ? $instance['attachment_id'] : 0;
		$url           = ! empty( $instance['url'] ) ? $instance['url'] : '';

		if ( ! empty( $title ) ) {
			echo $args['before_title'] . $title . $args['after_title'];
		}

		if ( $attachment_id || $url ) {
			$audio_url = $attachment_id ? wp_get_attachment_url( $attachment_id ) : $url;
			if ( $audio_url ) {
				echo wp_audio_shortcode( array( 'src' => $audio_url ) );
			}
		}

		echo $args['after_widget'];
	}

	/**
	 * Back-end widget form.
	 *
	 * @see WP_Widget::form()
	 *
	 * @param array $instance Previously saved values from database.
	 */
	public function form( $instance ) {
		$title         = ! empty( $instance['title'] ) ? $instance['title'] : '';
		$attachment_id = ! empty( $instance['attachment_id'] ) ? $instance['attachment_id'] : 0;
		$url           = ! empty( $instance['url'] ) ? $instance['url'] : '';
		?>

		<div class="media-widget-control">
			<fieldset>
				<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:' ); ?></label> 
				<input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
			</fieldset>

			<fieldset>
				<div class="media-widget-preview media_audio">

					<?php
					if ( $attachment_id || $url ) {
						$audio_url = $attachment_id ? wp_get_attachment_url( $attachment_id ) : $url;
						echo wp_audio_shortcode( array( 'src' => $audio_url ) );
					}
					?>

				</div>
						
				<?php
				if ( $attachment_id || $url ) {
				?>

					<div class="media-widget-buttons">
						<button type="button" class="button edit-media"><?php esc_html_e( 'Edit Audio' ); ?></button>
						<button type="button" class="button change-media select-media"><?php esc_html_e( 'Replace Audio' ); ?></button>
					</div>

				<?php
				} else {
				?>

					<div class="attachment-media-view">
						<button type="button" class="select-media button-add-media"><?php esc_html_e( 'Add Audio' ); ?></button>
					</div>

				<?php
				}
				?>

			</fieldset>
		</div>

		<input class="widefat" id="<?php echo $this->get_field_id( 'attachment_id' ); ?>" name="<?php echo $this->get_field_name( 'attachment_id' ); ?>" type="hidden" data-property="attachment_id" value="<?php echo esc_attr( $attachment_id ); ?>">
		<input class="widefat" id="<?php echo $this->get_field_id( 'url' ); ?>" name="<?php echo $this->get_field_name( 'url' ); ?>" type="hidden" data-property="url" value="<?php echo esc_url( $url ); ?>">

		<?php
	}

	/**
	 * Sanitize widget form values as they are saved.
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
		$instance['url']           = ! empty( $new_instance['url'] ) ? sanitize_url( $new_instance['url'] ) : '';

		return $instance;
	}

}
