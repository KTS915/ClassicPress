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
 *
 * @see WP_Widget_Media
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
				'no_media_selected'          => __( 'No audio selected' ),
				'add_media'                  => _x( 'Add Audio', 'label for button in the audio widget' ),
				'replace_media'              => _x( 'Replace Audio', 'label for button in the audio widget; should preferably not be longer than ~13 characters long' ),
				'edit_media'                 => _x( 'Edit Audio', 'label for button in the audio widget; should preferably not be longer than ~13 characters long' ),
				'missing_attachment'         => sprintf(
					/* translators: %s: URL to media library. *
					__( 'That audio file cannot be found. Check your <a href="%s">media library</a> and make sure it was not deleted.' ),
					esc_url( admin_url( 'upload.php' ) )
				),
				/* translators: %d: Widget count. *
				'media_library_state_multi'  => _n_noop( 'Audio Widget (%d)', 'Audio Widget (%d)' ),
				'media_library_state_single' => __( 'Audio Widget' ),
				'unsupported_file_type'      => __( 'Looks like this is not the correct kind of file. Please link to an audio file instead.' ),
			)
		);
*/	}




	/**
	 * Front-end display of widget.
	 *
	 * @see WP_Widget::widget()
	 *
	 * @param array $args     Widget arguments.
	 * @param array $instance Saved values from database.
	 */
	public function widget( $args, $instance ) {
		echo $args['before_widget'];

		$title    = ! empty( $instance['title'] ) ? $instance['title'] : '';
		$desc     = ! empty( $instance['desc'] ) ? $instance['desc'] : '';
		$link     = ! empty( $instance['link'] ) ? $instance['link'] : '';
		$blank    = ! empty( $instance['blank'] ) ? 'target="_blank"' : '';

		$src      = ! empty( $instance['src'] ) ? $instance['src'] : '';
		$poster   = ! empty( $instance['poster'] ) ? $instance['poster'] : '';
		$controls = ! empty( $instance['controls'] ) ? ' controls' : '';
		$loop     = ! empty( $instance['loop'] ) ? ' loop' : '';
		$autoplay = ! empty( $instance['autoplay'] ) ? ' autoplay' : '';
		$preload  = ! empty( $instance['preload'] ) ? ' preload' : '';


		if ( $title && filter_var( $link, FILTER_VALIDATE_URL ) ) {
			echo '<a href="' . $link . '" class="smy_audio_link" ' . $blank . '>'.
				 '<h3>' . $title . '</h3>'.
				 '</a>';
		} elseif ( $title ) {
			echo '<h3 class="smy_audio_title">' . $title . '</h3>';
		}


		if ( $poster && filter_var( $link, FILTER_VALIDATE_URL ) ) {
			echo '<a href="' . $link . '" class="smy_audio_link" ' . $blank . '>'.
				 '<img class="smy_audio_image" src="' . $poster . '"  id="' . $this->get_field_id( 'poster' ) . '_image" >'.
				 '</a>';
		} elseif ( $poster ) {
			echo '<img class="smy_audio_image" src="' . $poster . '"  id="' . $this->get_field_id( 'poster' ) . '_image" >';
		}

		echo '<audio src="' . $src . '" class="widefat"' . $controls . $loop . $autoplay . $preload . '></audio>';


		if ( $desc ) {
			echo '<p class="smy_audio_desc">' . $desc . '</p>';
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
		$title    = ! empty( $instance['title'] ) ? $instance['title'] : '';
		$desc     = ! empty( $instance['desc'] ) ? $instance['desc'] : '';
		$link     = ! empty( $instance['link'] ) ? $instance['link'] : 'http://';
		$blank    = ! empty( $instance['blank'] ) ? 'checked=checked' : '';

		$src      = ! empty( $instance['src'] ) ? $instance['src'] : '';
		$poster   = ! empty( $instance['poster'] ) ? $instance['poster'] : '';
		$controls = ! empty( $instance['controls'] ) ? 'checked=checked' : '';
		$loop     = ! empty( $instance['loop'] ) ? 'checked=checked' : '';
		$autoplay = ! empty( $instance['autoplay'] ) ? 'checked=checked' : '';
		$preload  = ! empty( $instance['preload'] ) ? 'checked=checked' : '';

		?>

		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Title:', 'audio_widget' ); ?></label> 
			<input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
		</p>


		<div id="<?php echo $this->get_field_id('src').'_type'; ?>">

			<?php
			echo '<img class="smy_audio_widget_image" src="' . $poster . '"  id="' . $this->get_field_id( 'poster' ) . '_image'.'">';
			//echo '<audio src="' . $src . '" class="widefat" controls></audio>';
			?>

		</div>

		<p>
			<button class="smy_audio_widget_add_audio button" id="<?php echo $this->get_field_id( 'src' ) . '_add_button'; ?>">
				<span class="smy_audio_buttons_icon"></span>
				<?php _e('Add Audio', 'audio_widget') ?>
			</button>

			<button class="smy_audio_widget_add_poster button" id="<?php echo $this->get_field_id( 'poster' ) . '_add_button'; ?>">
				<span class="smy_poster_buttons_icon"></span>
				<?php _e('Add Poster', 'audio_widget') ?>
			</button>

			<input type="hidden" class="smy_audio_widget_url" name="<?php echo $this->get_field_name( 'src' ); ?>" id="<?php echo $this->get_field_id( 'src' ) . '_url'; ?>" value="<?php echo esc_attr( $src ); ?>">
			<input type="hidden" class="smy_audio_widget_poster" name="<?php echo $this->get_field_name( 'poster' ); ?>" id="<?php echo $this->get_field_id( 'poster' ) . '_poster'; ?>" value="<?php echo esc_attr( $poster ); ?>">
		</p>

		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'desc' ) ); ?>"><?php esc_html_e( 'Description:', 'audio_widget' ); ?></label> 
			<textarea class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'desc' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'desc' ) ); ?>" rows="6" cols="20"><?php echo esc_textarea( $desc ); ?></textarea>
		</p>

		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'link' ) ); ?>"><?php esc_html_e( 'Link:', 'audio_widget' ); ?></label> 
			<input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'link' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'link' ) ); ?>" type="text" value="<?php echo esc_url( $link ); ?>">
		</p>

		<p>
			<input class="checkbox" id="<?php echo esc_attr( $this->get_field_id( 'blank' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'blank' ) ); ?>" type="checkbox" <?php echo esc_attr( $blank ); ?> >
			<label for="<?php echo esc_attr( $this->get_field_id( 'blank' ) ); ?>"><?php esc_html_e( 'Open link in new page?', 'audio_widget' ); ?></label>
		</p>

		<!-- Extra Audio & Video Options -->

		<p>
			<input class="checkbox" id="<?php echo esc_attr( $this->get_field_id( 'controls' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'controls' ) ); ?>" type="checkbox" <?php echo esc_attr( $controls ); ?> >
			<label for="<?php echo esc_attr( $this->get_field_id( 'controls' ) ); ?>"><?php esc_html_e( 'Add Controls to audio?', 'audio_widget' ); ?></label>
		</p>

		<p>
			<input class="checkbox" id="<?php echo esc_attr( $this->get_field_id( 'loop' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'loop' ) ); ?>" type="checkbox" <?php echo esc_attr( $loop ); ?> >
			<label for="<?php echo esc_attr( $this->get_field_id( 'loop' ) ); ?>"><?php esc_html_e( 'Loop audio?', 'audio_widget' ); ?></label>
		</p>

		<p>
			<input class="checkbox" id="<?php echo esc_attr( $this->get_field_id( 'autoplay' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'autoplay' ) ); ?>" type="checkbox" <?php echo esc_attr( $autoplay ); ?> >
			<label for="<?php echo esc_attr( $this->get_field_id( 'autoplay' ) ); ?>"><?php esc_html_e( 'Autoplay audio?', 'audio_widget' ); ?></label>
		</p>

		<p>
			<input class="checkbox" id="<?php echo esc_attr( $this->get_field_id( 'preload' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'preload' ) ); ?>" type="checkbox" <?php echo esc_attr( $preload ); ?> >
			<label for="<?php echo esc_attr( $this->get_field_id( 'preload' ) ); ?>"><?php esc_html_e( 'Preload audio?', 'audio_widget' ); ?></label>
		</p>

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
		$instance['title']    = ( ! empty( $new_instance['title'] ) ) ? sanitize_text_field( $new_instance['title'] ) : '';
		$instance['desc']     = ( ! empty( $new_instance['desc'] ) ) ? sanitize_text_field( $new_instance['desc'] ) : '';
		$instance['link']     = ( ! empty( $new_instance['link'] ) ) ? sanitize_text_field( $new_instance['link'] ) : '';
		$instance['blank']    = ( ! empty( $new_instance['blank'] ) ) ? sanitize_text_field( $new_instance['blank'] ) : '';
		$instance['src']      = ( ! empty( $new_instance['src'] ) ) ? sanitize_text_field( $new_instance['src'] ) : '';
		$instance['poster']   = ( ! empty( $new_instance['poster'] ) ) ? sanitize_text_field( $new_instance['poster'] ) : '';
		$instance['controls'] = ( ! empty( $new_instance['controls'] ) ) ? sanitize_text_field( $new_instance['controls'] ) : '';
		$instance['loop']     = ( ! empty( $new_instance['loop'] ) ) ? sanitize_text_field( $new_instance['loop'] ) : '';
		$instance['autoplay'] = ( ! empty( $new_instance['autoplay'] ) ) ? sanitize_text_field( $new_instance['autoplay'] ) : '';
		$instance['preload']  = ( ! empty( $new_instance['preload'] ) ) ? sanitize_text_field( $new_instance['preload'] ) : '';

		return $instance;
	}

}
