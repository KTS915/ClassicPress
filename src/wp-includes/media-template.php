<?php
/**
 * ClassicPress media templates.
 *
 * @package ClassicPress
 * @subpackage Media
 * @since 3.5.0
 */

/**
 * Prints the templates used in the media manager.
 *
 * @since 3.5.0
 */
function wp_print_media_templates() {
	$class = 'media-modal wp-core-ui';

	$alt_text_description = sprintf(
		/* translators: 1: Link to tutorial, 2: Additional link attributes, 3: Accessibility text. */
		__( '<a href="%1$s" %2$s>Learn how to describe the purpose of the image%3$s</a>. Leave empty if the image is purely decorative.' ),
		esc_url( 'https://www.w3.org/WAI/tutorials/images/decision-tree' ),
		'target="_blank" rel="noopener"',
		sprintf(
			'<span class="screen-reader-text"> %s</span>',
			/* translators: Hidden accessibility text. */
			__( '(opens in a new tab)' )
		)
	);
	?>

	<?php // Template for the media frame: used both in the media grid and in the media modal. ?>
	<template id="tmpl-media-frame">
		<div class="media-frame-title" id="media-frame-title"></div>
		<h2 class="media-frame-menu-heading"><?php _ex( 'Actions', 'media modal menu actions' ); ?></h2>
		<button type="button" class="button button-link media-frame-menu-toggle" aria-expanded="false">
			<?php _ex( 'Menu', 'media modal menu' ); ?>
			<span class="dashicons dashicons-arrow-down" aria-hidden="true"></span>
		</button>
		<div class="media-frame-menu"></div>
		<div class="media-frame-tab-panel">
			<div class="media-frame-router"></div>
			<div class="media-frame-content"></div>
		</div>
		<h2 class="media-frame-actions-heading screen-reader-text">
		<?php
			/* translators: Hidden accessibility text. */
			_e( 'Selected media actions' );
		?>
		</h2>
		<div class="media-frame-toolbar"></div>
		<div class="media-frame-uploader"></div>
	</template>

	<?php // Template for the media modal. ?>
	<template id="tmpl-media-modal">
		<dialog class="<?php echo $class; ?>" aria-labelledby="media-frame-title">
			<button type="button" class="media-modal-close">
				<span class="media-modal-icon">
					<span class="screen-reader-text">
						<?php
						/* translators: Hidden accessibility text. */
						_e( 'Close dialog' );
						?>
					</span>
				</span>
			</button>
			<div class="media-modal-content"></div>
		</dialog>
	</template>

	<?php // Template for the window uploader, used for example in the media grid. ?>
	<template id="tmpl-uploader-window">
		<div class="uploader-window-content">
			<div class="uploader-editor-title"><?php _e( 'Drop files to upload' ); ?></div>
		</div>
	</template>

	<?php // Template for the editor uploader. ?>
	<template id="tmpl-uploader-editor">
		<div class="uploader-editor-content">
			<div class="uploader-editor-title"><?php _e( 'Drop files to upload' ); ?></div>
		</div>
	</template>

	<?php // Template for the inline uploader, used for example in the Media Library admin page - Add New. ?>
	<template id="tmpl-uploader-inline">
		<button class="close dashicons dashicons-no">
			<span class="screen-reader-text">
				<?php
				/* translators: Hidden accessibility text. */
				_e( 'Close uploader' );
				?>
			</span>
		</button>
		<div class="uploader-inline-content">
			<h2 class="upload-message"></h2>

			<?php if ( ! _device_can_upload() ) : ?>

				<div class="upload-ui">
					<h2 class="upload-instructions"><?php _e( 'Your browser cannot upload files' ); ?></h2>
					<p>

						<?php
						printf(
							/* translators: %s: https://apps.wordpress.org/ */
							__( 'The web browser on your device cannot be used to upload files. You may be able to use the <a href="%s">native app for your device</a> instead.' ),
							'https://apps.wordpress.org/'
						);
						?>

					</p>
				</div>

			<?php elseif ( is_multisite() && ! is_upload_space_available() ) : ?>

				<div class="upload-ui">
					<h2 class="upload-instructions"><?php _e( 'Upload Limit Exceeded' ); ?></h2>

					<?php
					/** This action is documented in wp-admin/includes/media.php */
					do_action( 'upload_ui_over_quota' );
					?>

				</div>

			<?php else : ?>

				<div class="upload-ui">
					<h2 class="upload-instructions drop-instructions"><?php _e( 'Drop files to upload' ); ?></h2>
					<p class="upload-instructions drop-instructions"><?php _ex( 'or', 'Uploader: Drop files here - or - Select Files' ); ?></p>
					<button type="button" class="browser button button-hero" aria-labelledby="post-upload-info"><?php _e( 'Select Files' ); ?></button>
				</div>
				<div class="upload-inline-status"></div>
				<div class="post-upload-ui" id="post-upload-info">

					<?php
					/** This action is documented in wp-admin/includes/media.php */
					do_action( 'pre-upload-ui' ); // phpcs:ignore WordPress.NamingConventions.ValidHookName.UseUnderscores
					/** This action is documented in wp-admin/includes/media.php */
					do_action( 'pre-plupload-upload-ui' ); // phpcs:ignore WordPress.NamingConventions.ValidHookName.UseUnderscores

					if ( 10 === remove_action( 'post-plupload-upload-ui', 'media_upload_flash_bypass' ) ) {
						/** This action is documented in wp-admin/includes/media.php */
						do_action( 'post-plupload-upload-ui' ); // phpcs:ignore WordPress.NamingConventions.ValidHookName.UseUnderscores
						add_action( 'post-plupload-upload-ui', 'media_upload_flash_bypass' );
					} else {
						/** This action is documented in wp-admin/includes/media.php */
						do_action( 'post-plupload-upload-ui' ); // phpcs:ignore WordPress.NamingConventions.ValidHookName.UseUnderscores
					}

					global $pagenow;
					if ( $pagenow !== 'upload.php' ) {
						$storefolders = get_option( 'uploads_use_yearmonth_folders' );
						if ( $storefolders === '3' ) {
							$cat_subfolder = get_option( 'media_cat_upload_folder' );
							$cat_object = get_term_by( 'slug', trim( $cat_subfolder, '/' ), 'media_category' );
							if ( ! empty( $cat_object ) ) {
								printf(
									/* translators: 1: Name of media category, 2: Link to Media page in admin. */
									__( '<p class="media-cat-upload-info">Any files you upload here will be associated with the %1$s media category.</p><p class="media-cat-upload-info">If you want to change this to a different media category, you can do so on the main <a href="%2$s">Media</a> page.</p>' ),
									'<strong>' . esc_html( $cat_object->name ) . '</strong>',
									esc_url( admin_url( 'upload.php' ) )
								);
							}
						}
					}

					$max_upload_size = wp_max_upload_size();
					if ( ! $max_upload_size ) {
						$max_upload_size = 0;
					}
					?>

					<p class="max-upload-size">
						<?php
						printf(
							/* translators: %s: Maximum allowed file size. */
							__( 'Maximum upload file size: %s.' ),
							esc_html( size_format( $max_upload_size ) )
						);
						?>
					</p>
					<p class="suggested-dimensions"></p>

					<?php
					/** This action is documented in wp-admin/includes/media.php */
					do_action( 'post-upload-ui' ); // phpcs:ignore WordPress.NamingConventions.ValidHookName.UseUnderscores
					?>

				</div>

			<?php endif; ?>

		</div>
	</template>

	<?php // Template for the view switchers, used for example in the Media Grid. ?>
	<template id="tmpl-media-library-view-switcher">
		<a href="<?php echo esc_url( add_query_arg( 'mode', 'list', admin_url( 'upload.php' ) ) ); ?>" class="view-list">
			<span class="screen-reader-text">
				<?php
				/* translators: Hidden accessibility text. */
				_e( 'List view' );
				?>
			</span>
		</a>
		<a href="<?php echo esc_url( add_query_arg( 'mode', 'grid', admin_url( 'upload.php' ) ) ); ?>" class="view-grid current" aria-current="page">
			<span class="screen-reader-text">
				<?php
				/* translators: Hidden accessibility text. */
				_e( 'Grid view' );
				?>
			</span>
		</a>
	</template>

	<?php // Template for the uploading status UI. ?>
	<template id="tmpl-uploader-status">
		<h2><?php _e( 'Uploading' ); ?></h2>

		<div class="media-progress-bar"><div></div></div>
		<div class="upload-details">
			<span class="upload-count">
				<span class="upload-index"></span> / <span class="upload-total"></span>
			</span>
			<span class="upload-detail-separator">&ndash;</span>
			<span class="upload-filename"></span>
		</div>
		<div class="upload-errors"></div>
		<button type="button" class="button upload-dismiss-errors"><?php _e( 'Dismiss errors' ); ?></button>
	</template>

	<?php // Template for the uploading status errors. ?>
	<template id="tmpl-uploader-status-error">
		<span class="upload-error-filename"></span>
		<span class="upload-error-message"></span>
	</template>

	<?php // Template for the Attachment Details layout in the media browser. ?>
	<template id="tmpl-edit-attachment-frame">
		<div class="edit-media-header">
			<button class="left dashicons">
				<span class="screen-reader-text">
					<?php /* translators: Hidden accessibility text. */ _e( 'Edit previous media item' ); ?>
				</span>
			</button>
			<button class="right dashicons">
				<span class="screen-reader-text">
					<?php /* translators: Hidden accessibility text. */ _e( 'Edit next media item' ); ?>
				</span>
			</button>
			<button type="button" class="media-modal-close">
				<span class="media-modal-icon">
					<span class="screen-reader-text"><?php _e( 'Close dialog' ); ?></span>
				</span>
			</button>
		</div>
		<div class="media-frame-title"></div>
		<div class="media-frame-content"></div>
	</template>

	<?php // Template for the Attachment "thumbnails" in the Media Grid. ?>
	<template id="tmpl-attachment">
		<div class="attachment-preview js--select-attachment">
			<div class="thumbnail">
				<div class="media-progress-bar">
					<div></div>
				</div>
				<div class="centered">
					<img class="thumbnail-image" src="" draggable="false" alt="">
					<img class="icon-image icon" src="" draggable="false" alt="">
				</div>
				<div class="filename">
					<div class="filename-text"></div>
				</div>
			</div>
			<button type="button" class="button-link attachment-close media-modal-icon">
				<span class="screen-reader-text">
					<?php
					/* translators: Hidden accessibility text. */
					_e( 'Remove' );
					?>
				</span>
			</button>
			<button type="button" class="check" tabindex="-1">
				<span class="media-modal-icon"></span>
				<span class="screen-reader-text">
					<?php
					/* translators: Hidden accessibility text. */
					_e( 'Deselect' );
					?>
				</span>
			</button>
			<input type="text" class="describe"
				data-setting=""
				aria-label=""
				placeholder=""
			>
		</div>
	</template>

	<?php // Template for the Attachment details, used for example in the sidebar. ?>
	<template id="tmpl-attachment-details">
		<h2>
			<?php _e( 'Attachment Details' ); ?>
			<span class="settings-save-status" role="status">
				<span class="spinner"></span>
				<span class="saved"><?php esc_html_e( 'Saved.' ); ?></span>
			</span>
		</h2>
		<div class="attachment-info">
			<div class="thumbnail thumbnail-type">
				<div class="media-progress-bar"><div></div></div>
				<img class="details-image" src="" draggable="false" alt="">
				<img class="details-icon icon" src="" draggable="false" alt="">
				<div class="wp-media-wrapper wp-audio">
					<audio controls class="wp-audio-shortcode" width="100%" preload="none">
						<source type="" src="">
					</audio>
				</div>
				<div class="wp-media-wrapper wp-video">
					<video controls class="wp-video-shortcode" preload="metadata">
						<source type="" src="">
					</video>
				</div>
			</div>
			<div class="details">
				<div class="filename"></div>
				<div class="uploaded"></div>
				<div class="file-size"></div>
				<div class="dimensions"></div>
				<div class="word-wrap-break-word original-image">
					<?php _e( 'Original image' ); ?>
					<a class="original-image-link" href=""></a>
				</div>
				<a class="edit-attachment" href="" target="_blank"><?php _e( 'Edit Image' ); ?></a>
				<div class="file-length">
					<?php _e( 'Length:' ); ?>
					<span aria-hidden="true" class="file-length-formatted"></span>
					<span class="screen-reader-text file-length-human-readable"></span>
				</div>
				<div class="media-states">
					<strong><?php _e( 'Used as:' ); ?></strong> <span class="media-states-text"></span>
				</div>
				<div class="compat-meta"></div>
			</div>
		</div>
		<div class="settings">
			<span class="setting alt-text has-description" data-setting="alt">
				<label for="attachment-details-alt-text" class="name"><?php _e( 'Alt Text' ); ?></label>
				<textarea id="attachment-details-alt-text" aria-describedby="alt-text-description"></textarea>
			</span>
			<p class="description" id="alt-text-description"><?php echo $alt_text_description; ?></p>

			<?php if ( post_type_supports( 'attachment', 'title' ) ) : ?>

				<span class="setting" data-setting="title">
					<label for="attachment-details-title" class="name"><?php _e( 'Title' ); ?></label>
					<input type="text" id="attachment-details-title">
				</span>

			<?php endif; ?>

			<span class="setting" data-setting="caption">
				<label for="attachment-details-caption" class="name"><?php _e( 'Caption' ); ?></label>
				<textarea id="attachment-details-caption"></textarea>
			</span>
			<span class="setting" data-setting="description">
				<label for="attachment-details-description" class="name"><?php _e( 'Description' ); ?></label>
				<textarea id="attachment-details-description"></textarea>
			</span>
			<span class="setting" data-setting="url">
				<label for="attachment-details-copy-link" class="name"><?php _e( 'File URL' ); ?></label>
				<input type="text" class="attachment-details-copy-link" id="attachment-details-copy-link" readonly>
				<div class="copy-to-clipboard-container">
					<button type="button" class="button button-small copy-attachment-url media-library" data-clipboard-target="attachment-details-copy-link"><?php _e( 'Copy URL to clipboard' ); ?></button>
					<span class="success hidden" aria-hidden="true"><?php _e( 'Copied!' ); ?></span>
				</div>
			</span>
		</div>
		<div class="compat-meta"></div>
		<div class="actions">
			<button type="button" class="button-link untrash-attachment"><?php _e( 'Restore from Trash' ); ?></button>
			<button type="button" class="button-link trash-attachment"><?php _e( 'Move to Trash' ); ?></button>
			<button type="button" class="button-link delete-attachment"><?php _e( 'Delete permanently' ); ?></button>
		</div>
	</template>

	<?php // Template for the Selection status bar. ?>
	<template id="tmpl-media-selection">
		<div class="selection-info">
			<span class="count"></span>
			<button type="button" class="button-link edit-selection"><?php _e( 'Edit Selection' ); ?></button>
			<button type="button" class="button-link clear-selection"><?php _e( 'Clear' ); ?></button>
		</div>
		<div class="selection-view"></div>
	</template>

	<?php // Template for the Attachment display settings, used for example in the sidebar. ?>
	<template id="tmpl-attachment-display-settings">
		<h2><?php _e( 'Attachment Display Settings' ); ?></h2>
		<span class="setting align" data-setting="align">
			<label for="attachment-display-settings-alignment" class="name"><?php _e( 'Alignment' ); ?></label>
			<select id="attachment-display-settings-alignment" class="alignment" data-setting="align">
				<option value="left">
					<?php esc_html_e( 'Left' ); ?>
				</option>
				<option value="center">
					<?php esc_html_e( 'Center' ); ?>
				</option>
				<option value="right">
					<?php esc_html_e( 'Right' ); ?>
				</option>
				<option value="none" selected>
					<?php esc_html_e( 'None' ); ?>
				</option>
			</select>
		</span>

		<span class="setting hidden" data-setting="linkUrl">
			<label for="attachment-display-settings-link-to-custom" class="name"><?php _e( 'URL' ); ?></label>
			<input type="text" id="attachment-display-settings-link-to-custom" class="link-to-custom" data-setting="linkUrl">
		</span>
		<span class="setting size" data-setting="size">
			<label for="attachment-display-settings-size" class="name"><?php _e( 'Size' ); ?></label>
			<select id="attachment-display-settings-size" class="size" name="size" data-setting="size">

				<?php
				/** This filter is documented in wp-admin/includes/media.php */
				$sizes = apply_filters(
					'image_size_names_choose',
					array(
						'thumbnail' => __( 'Thumbnail' ),
						'medium'    => __( 'Medium' ),
						'large'     => __( 'Large' ),
						'full'      => __( 'Full Size' ),
					)
				);
				foreach ( $sizes as $value => $name ) {
					?>

					<option value="<?php echo esc_attr( $value ); ?>" data-size-slug="<?php echo esc_attr( $value ); ?>"><?php echo esc_html( $name ); ?></option>

					<?php
				}
				?>

			</select>
		</span>
	</template>

	<?php // Template for the Gallery settings, used for example in the sidebar. ?>
	<template id="tmpl-gallery-settings">
		<h2><?php _e( 'Gallery Settings' ); ?></h2>

		<span class="setting" data-setting="link">
			<label for="gallery-settings-link-to" class="name"><?php _e( 'Link To' ); ?></label>
			<select id="gallery-settings-link-to" class="link-to" data-setting="link">
				<option value="post"><?php esc_html_e( 'Attachment Page' ); ?></option>
				<option value="file"><?php esc_html_e( 'Media File' ); ?></option>
				<option value="none"><?php esc_html_e( 'None' ); ?></option>
			</select>
		</span>

		<span class="setting">
			<label for="gallery-settings-columns" class="name select-label-inline"><?php _e( 'Columns' ); ?></label>
			<select id="gallery-settings-columns" class="columns" name="columns" data-setting="columns">
				<?php for ( $i = 1; $i <= 9; $i++ ) : ?>
					<option value="<?php echo esc_attr( $i ); ?>"><?php echo esc_html( $i ); ?></option>
				<?php endfor; ?>
			</select>
		</span>

		<span class="setting" data-setting="orderbyRandom">
			<input type="checkbox" id="gallery-settings-random-order">
			<label for="gallery-settings-random-order" class="checkbox-label-inline"><?php _e( 'Random Order' ); ?></label>
		</span>

		<span class="setting size" data-setting="size">
			<label for="gallery-settings-size" class="name"><?php _e( 'Size' ); ?></label>
			<select id="gallery-settings-size" class="size" name="size" data-setting="size">

				<?php
				/** This filter is documented in wp-admin/includes/media.php */
				$size_names = apply_filters(
					'image_size_names_choose',
					array(
						'thumbnail' => __( 'Thumbnail' ),
						'medium'    => __( 'Medium' ),
						'large'     => __( 'Large' ),
						'full'      => __( 'Full Size' ),
					)
				);

				foreach ( $size_names as $size => $label ) {
					?>

					<option value="<?php echo esc_attr( $size ); ?>">
						<?php echo esc_html( $label ); ?>
					</option>

					<?php
				}
				?>

			</select>
		</span>
	</template>

	<?php // Template for the Playlists settings, used for example in the sidebar. ?>
	<template id="tmpl-playlist-settings">
		<h2><?php _e( 'Playlist Settings' ); ?></h2>
		<span class="setting" data-setting="tracklist">
			<input type="checkbox" id="playlist-settings-show-list">
			<label for="playlist-settings-show-list" class="checkbox-label-inline">
				<span class="label-audio"><?php _e( 'Show Tracklist' ); ?></span>
				<span class="label-video"><?php _e( 'Show Video List' ); ?></span>
			</label>
		</span>

		<span class="setting" data-setting="artists">
			<input type="checkbox" id="playlist-settings-show-artist">
			<label for="playlist-settings-show-artist" class="checkbox-label-inline"><?php _e( 'Show Artist Name in Tracklist' ); ?></label>
		</span>
		<span class="setting" data-setting="images">
			<input type="checkbox" id="playlist-settings-show-images">
			<label for="playlist-settings-show-images" class="checkbox-label-inline"><?php _e( 'Show Images' ); ?></label>
		</span>
	</template>

	<?php // Template for the "Insert from URL" layout. ?>
	<template id="tmpl-embed-link-settings">
		<span class="setting link-text">
			<label for="embed-link-settings-link-text" class="name"><?php _e( 'Link Text' ); ?></label>
			<input type="text" id="embed-link-settings-link-text" class="alignment" data-setting="linkText">
		</span>
		<div class="embed-container" style="display: none;">
			<div class="embed-preview"></div>
		</div>
	</template>

	<?php // Template for the "Insert from URL" image preview and details. ?>
	<template id="tmpl-embed-image-settings">
		<div class="wp-clearfix">
			<div class="thumbnail">
				<img src="" draggable="false" alt="">
			</div>
		</div>

		<span class="setting alt-text has-description">
			<label for="embed-image-settings-alt-text" class="name"><?php _e( 'Alternative Text' ); ?></label>
			<textarea id="embed-image-settings-alt-text" data-setting="alt" aria-describedby="alt-text-description"></textarea>
		</span>
		<p class="description" id="alt-text-description"><?php echo $alt_text_description; ?></p>

		<?php
		/** This filter is documented in wp-admin/includes/media.php */
		if ( ! apply_filters( 'disable_captions', '' ) ) :
			?>
			<span class="setting caption">
				<label for="embed-image-settings-caption" class="name"><?php _e( 'Caption' ); ?></label>
				<textarea id="embed-image-settings-caption" data-setting="caption"></textarea>
			</span>
		<?php endif; ?>

		<fieldset class="setting-group">
			<legend class="name"><?php _e( 'Align' ); ?></legend>
			<span class="setting align">
				<span class="button-group button-large" data-setting="align">
					<button class="button" value="left">
						<?php esc_html_e( 'Left' ); ?>
					</button>
					<button class="button" value="center">
						<?php esc_html_e( 'Center' ); ?>
					</button>
					<button class="button" value="right">
						<?php esc_html_e( 'Right' ); ?>
					</button>
					<button class="button active" value="none">
						<?php esc_html_e( 'None' ); ?>
					</button>
				</span>
			</span>
		</fieldset>

		<fieldset class="setting-group">
			<legend class="name"><?php _e( 'Link To' ); ?></legend>
			<span class="setting link-to">
				<span class="button-group button-large" data-setting="link">
					<button class="button" value="file">
						<?php esc_html_e( 'Image URL' ); ?>
					</button>
					<button class="button" value="custom">
						<?php esc_html_e( 'Custom URL' ); ?>
					</button>
					<button class="button active" value="none">
						<?php esc_html_e( 'None' ); ?>
					</button>
				</span>
			</span>
			<span class="setting">
				<label for="embed-image-settings-link-to-custom" class="name"><?php _e( 'URL' ); ?></label>
				<input type="text" id="embed-image-settings-link-to-custom" class="link-to-custom" data-setting="linkUrl">
			</span>
		</fieldset>
	</template>

	<?php // Template for the Image details, used for example in the editor. ?>
	<template id="tmpl-image-details">
		<div class="media-embed">
			<div class="embed-media-settings">
				<div class="column-settings">
					<span class="setting alt-text has-description" data-setting="alt">
						<label for="image-details-alt-text" class="name"><?php _e( 'Alternative Text' ); ?></label>
						<textarea id="image-details-alt-text" data-setting="alt" aria-describedby="alt-text-description"></textarea>
					</span>
					<p class="description" id="alt-text-description"><?php echo $alt_text_description; ?></p>

					<?php
					/** This filter is documented in wp-admin/includes/media.php */
					if ( ! apply_filters( 'disable_captions', '' ) ) {
						?>

						<span class="setting caption" data-setting="caption">
							<label for="image-details-caption" class="name"><?php _e( 'Caption' ); ?></label>
							<textarea id="image-details-caption" data-setting="caption"></textarea>
						</span>

						<?php
					}
					?>

					<h2><?php _e( 'Display Settings' ); ?></h2>
					<fieldset class="setting-group">
						<legend class="legend-inline"><?php _e( 'Align' ); ?></legend>
						<span class="setting align">
							<span class="button-group button-large" data-setting="align">
								<button class="button" value="left">
									<?php esc_html_e( 'Left' ); ?>
								</button>
								<button class="button" value="center">
									<?php esc_html_e( 'Center' ); ?>
								</button>
								<button class="button" value="right">
									<?php esc_html_e( 'Right' ); ?>
								</button>
								<button class="button active" value="none">
									<?php esc_html_e( 'None' ); ?>
								</button>
							</span>
						</span>
					</fieldset>

					<div class="setting-group attachment-only" hidden>
						<span class="setting size">
							<label for="image-details-size" class="name"><?php _e( 'Size' ); ?></label>
							<select id="image-details-size" class="size" name="size" data-setting="size">

								<?php
								/** This filter is documented in wp-admin/includes/media.php */
								$sizes = apply_filters(
									'image_size_names_choose',
									array(
										'thumbnail' => __( 'Thumbnail' ),
										'medium'    => __( 'Medium' ),
										'large'     => __( 'Large' ),
										'full'      => __( 'Full Size' ),
									)
								);

								foreach ( $sizes as $value => $name ) {
									?>

									<option value="<?php echo esc_attr( $value ); ?>" data-size-slug="<?php echo esc_attr( $value ); ?>">
										<?php echo esc_html( $name ); ?>
									</option>

									<?php
								}
								?>

							</select>
						</span>

						<div class="custom-size wp-clearfix hidden">
							<span class="custom-size-setting">
								<label for="image-details-size-width"><?php _e( 'Width' ); ?></label>
								<input type="number" id="image-details-size-width" aria-describedby="image-size-desc" data-setting="customWidth" step="1" value="">
							</span>
							<span class="sep" aria-hidden="true">&times;</span>
							<span class="custom-size-setting">
								<label for="image-details-size-height"><?php _e( 'Height' ); ?></label>
								<input type="number" id="image-details-size-height" aria-describedby="image-size-desc" data-setting="customHeight" step="1" value="">
							</span>
							<p id="image-size-desc" class="description"><?php _e( 'Image size in pixels' ); ?></p>
						</div>
					</div>

					<span class="setting link-to" data-setting="link">
						<label for="image-details-link-to" class="name"><?php _e( 'Link To' ); ?></label>
						<select id="image-details-link-to" data-setting="link">
							<option value="file" class="option-file-attachment">
								<?php esc_html_e( 'Media File' ); ?>
							</option>
							<option value="post" class="option-post-attachment">
								<?php esc_html_e( 'Attachment Page' ); ?>
							</option>
							<option value="file" class="option-file-url">
								<?php esc_html_e( 'Image URL' ); ?>
							</option>
							<option value="custom" class="option-custom-url">
								<?php esc_html_e( 'Custom URL' ); ?>
							</option>
							<option value="none">
								<?php esc_html_e( 'None' ); ?>
							</option>
						</select>
					</span>

					<div class="link-settings">
						<span class="setting" data-setting="linkUrl">
							<label for="image-details-link-to-custom" class="name"><?php _e( 'URL' ); ?></label>
							<input type="text" id="image-details-link-to-custom" class="link-to-custom" data-setting="linkUrl">
						</span>
					</div>

					<div class="advanced-section">
						<h2><button type="button" class="button-link advanced-toggle"><?php _e( 'Advanced Options' ); ?></button></h2>
						<div class="advanced-settings hidden">
							<div class="advanced-image">
								<span class="setting title-text">
									<label for="image-details-title-attribute" class="name"><?php _e( 'Image Title Attribute' ); ?></label>
									<input type="text" id="image-details-title-attribute" data-setting="title" value="">
								</span>
								<span class="setting extra-classes">
									<label for="image-details-css-class" class="name"><?php _e( 'Image CSS Class' ); ?></label>
									<input type="text" id="image-details-css-class" data-setting="extraClasses" value="">
								</span>
							</div>
							<div class="advanced-link">
								<span class="setting link-target">
									<input type="checkbox" id="image-details-link-target" data-setting="linkTargetBlank" value="_blank">
									<label for="image-details-link-target" class="checkbox-label"><?php _e( 'Open link in a new tab' ); ?></label>
								</span>
								<span class="setting link-rel">
									<label for="image-details-link-rel" class="name"><?php _e( 'Link Rel' ); ?></label>
									<input type="text" id="image-details-link-rel" data-setting="linkRel" value="">
								</span>
								<span class="setting link-class-name">
									<label for="image-details-link-css-class" class="name"><?php _e( 'Link CSS Class' ); ?></label>
									<input type="text" id="image-details-link-css-class" data-setting="linkClassName" value="">
								</span>
							</div>
						</div>
					</div>
				</div>
				<div class="column-image">
					<div class="image">
						<img src="" draggable="false" alt="">
						<div class="actions attachment-only" hidden>
							<input type="button" class="edit-attachment button" value="<?php esc_attr_e( 'Edit Original' ); ?>">
							<input type="button" class="replace-attachment button" value="<?php esc_attr_e( 'Replace' ); ?>">
						</div>
					</div>
				</div>
			</div>
		</div>
	</template>

	<?php // Template for the Image Editor layout. ?>
	<template id="tmpl-image-editor">
		<div></div>
		<div></div>
	</template>

	<?php // Template for embedded Audio details. ?>
	<template id="tmpl-audio-details">
		<div class="media-embed media-embed-details">
			<div class="embed-media-settings embed-audio-settings">
				<audio style="visibility:hidden;" controls class="wp-audio-shortcode" width="100%" preload="none"></audio>
				<div class="audio-sources">

					<?php
					foreach ( wp_get_audio_extensions() as $type ) {
						?>

						<span class="setting audio-source-<?php echo esc_attr( $type ); ?>" data-setting="<?php echo esc_attr( $type ); ?>" hidden>
							<label for="audio-details-<?php echo esc_attr( $type ); ?>-source" class="name"><?php echo esc_html( strtoupper( $type ) ); ?></label>
							<input type="text" id="audio-details-<?php echo esc_attr( $type ); ?>-source" readonly data-setting="<?php echo esc_attr( $type ); ?>">
							<button type="button" class="button-link remove-setting"><?php _e( 'Remove audio source' ); ?></button>
						</span>

						<?php
					}
					?>

				</div>
				<div class="additional-audio-sources" hidden>
					<fieldset class="setting-group">
						<legend class="name"><?php _e( 'Add alternate sources for maximum HTML5 playback' ); ?></legend>
						<span class="setting">
							<span class="button-large additional-source-buttons"></span>
						</span>
					</fieldset>
				</div>
				<fieldset class="setting-group">
					<legend class="name"><?php _e( 'Preload' ); ?></legend>
					<span class="setting preload">
						<span class="button-group button-large" data-setting="preload">
							<button class="button" value="auto"><?php _ex( 'Auto', 'auto preload' ); ?></button>
							<button class="button" value="metadata"><?php _e( 'Metadata' ); ?></button>
							<button class="button active" value="none"><?php _e( 'None' ); ?></button>
						</span>
					</span>
				</fieldset>
				<span class="setting-group">
					<span class="setting checkbox-setting autoplay">
						<input type="checkbox" id="audio-details-autoplay" data-setting="autoplay">
						<label for="audio-details-autoplay" class="checkbox-label"><?php _e( 'Autoplay' ); ?></label>
					</span>
					<span class="setting checkbox-setting">
						<input type="checkbox" id="audio-details-loop" data-setting="loop">
						<label for="audio-details-loop" class="checkbox-label"><?php _e( 'Loop' ); ?></label>
					</span>
				</span>
			</div>
		</div>
	</template>

	<?php // Template for embedded Video details. ?>
	<template id="tmpl-video-details">
		<div class="media-embed media-embed-details">
			<div class="embed-media-settings embed-video-settings">
				<div class="wp-video-holder">
					<video controls class="wp-video-shortcode" preload="metadata"></video>
				</div>
				<div class="video-sources">

					<?php foreach ( wp_get_video_extensions() as $type ) {
						?>

						<span class="setting video-source-<?php echo esc_attr( $type ); ?>" data-setting="<?php echo esc_attr( $type ); ?>" hidden>
							<label for="video-details-<?php echo esc_attr( $type ); ?>-source" class="name"><?php echo esc_html( strtoupper( $type ) ); ?></label>
							<input type="text" id="video-details-<?php echo esc_attr( $type ); ?>-source" readonly data-setting="<?php echo esc_attr( $type ); ?>">
							<button type="button" class="button-link remove-setting"><?php _e( 'Remove video source' ); ?></button>
						</span>

						<?php
					}
					?>

				</div>

				<div class="additional-video-sources" hidden>
					<fieldset class="setting-group">
						<legend class="name"><?php _e( 'Add alternate sources for maximum HTML5 playback' ); ?></legend>
						<span class="setting">
							<span class="button-large additional-source-buttons"></span>
						</span>
					</fieldset>
				</div>
				<span class="setting poster-image" hidden>
					<label for="video-details-poster-image" class="name"><?php _e( 'Poster Image' ); ?></label>
					<input type="text" id="video-details-poster-image" readonly data-setting="poster">
					<button type="button" class="button-link remove-setting"><?php _e( 'Remove poster image' ); ?></button>
				</span>
				<fieldset class="setting-group">
					<legend class="name"><?php _e( 'Preload' ); ?></legend>
					<span class="setting preload">
						<span class="button-group button-large" data-setting="preload">
							<button class="button" value="auto"><?php _ex( 'Auto', 'auto preload' ); ?></button>
							<button class="button" value="metadata"><?php _e( 'Metadata' ); ?></button>
							<button class="button active" value="none"><?php _e( 'None' ); ?></button>
						</span>
					</span>
				</fieldset>
				<span class="setting-group">
					<span class="setting checkbox-setting autoplay">
						<input type="checkbox" id="video-details-autoplay" data-setting="autoplay">
						<label for="video-details-autoplay" class="checkbox-label"><?php _e( 'Autoplay' ); ?></label>
					</span>
					<span class="setting checkbox-setting">
						<input type="checkbox" id="video-details-loop" data-setting="loop">
						<label for="video-details-loop" class="checkbox-label"><?php _e( 'Loop' ); ?></label>
					</span>
				</span>
			</div>
		</div>
	</template>

	<?php // Template for the Crop area layout, used for example in the Customizer. ?>
	<template id="tmpl-crop-content">
		<img class="crop-image" src="" alt="<?php esc_attr_e( 'Image crop area preview. Requires mouse interaction.' ); ?>">
		<div class="upload-errors"></div>
	</template>

	<?php // Template for the Site Icon preview, used for example in the Customizer. ?>
	<template id="tmpl-site-icon-preview">
		<h2><?php _e( 'Preview' ); ?></h2>
		<strong aria-hidden="true"><?php _e( 'As a browser icon' ); ?></strong>
		<div class="favicon-preview">
			<img src="<?php echo esc_url( admin_url( 'images/' . ( is_rtl() ? 'browser-rtl.png' : 'browser.png' ) ) ); ?>" class="browser-preview" width="182" height="" alt="">

			<div class="favicon">
				<img id="preview-favicon" src="" alt="<?php esc_attr_e( 'Preview as a browser icon' ); ?>">
			</div>
			<span class="browser-title" aria-hidden="true"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></span>
		</div>

		<strong aria-hidden="true"><?php _e( 'As an app icon' ); ?></strong>
		<div class="app-icon-preview">
			<img id="preview-app-icon" src="" alt="<?php esc_attr_e( 'Preview as an app icon' ); ?>">
		</div>
	</template>

	<?php

	/**
	 * Fires when the custom media templates are printed.
	 *
	 * @since 3.5.0
	 */
	do_action( 'print_media_templates' );
}
