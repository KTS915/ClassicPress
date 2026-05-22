/**
 * Functions for media templates inside the ClassicpRess admin.
 *
 * @since CP-2.8.0
 * @output wp-includes/js/media-mamager.js
 */

/* global cpMediaManagerL10n */

wp.media.renderUploaderStatusError = function( container, data ) {
	var tpl = document.getElementById( 'tmpl-uploader-status-error' ),
		clone = tpl.content.cloneNode( true );

	clone.querySelector( '.upload-error-filename' ).innerHTML = data.filename;
	clone.querySelector( '.upload-error-message' ).textContent = data.message;
	container.appendChild( clone );
};

wp.media.renderCropContent = function( container, data ) {
	var tpl = document.getElementById( 'tmpl-crop-content' ),
	clone = tpl.content.cloneNode( true );

	clone.querySelector( '.crop-image' ).src = data.url;
	container.appendChild( clone );
};

wp.media.renderImageEditor = function( container, data ) {
	var tpl = document.getElementById( 'tmpl-image-editor' ),
		clone = tpl.content.cloneNode( true );
		divs = clone.querySelectorAll( 'div' );

	divs[0].id = 'media-head-' + data.id;
	divs[1].id = 'image-editor-' + data.id;
	container.appendChild( clone );
};

wp.media.renderSiteIconPreview = function( container, data ) {
	var tpl = document.getElementById( 'tmpl-site-icon-preview' ),
		clone = tpl.content.cloneNode( true );

	clone.querySelector( '#preview-favicon' ).src = data.url;
	clone.querySelector( '#preview-app-icon' ).src = data.url;
	container.appendChild( clone );
};

wp.media.renderMediaSelection = function( container, data ) {
	var tpl = document.getElementById( 'tmpl-media-selection' ),
		clone = tpl.content.cloneNode( true );

	clone.querySelector( '.count' ).textContent = data.count;
	clone.querySelector( '.edit-selection' ).hidden = ! data.editable;
	clone.querySelector( '.clear-selection' ).hidden = ! data.clearable;
	container.appendChild( clone );
};

wp.media.renderEmbedImageSettings = function( container, data ) {
	var captionEl,
		tpl = document.getElementById( 'tmpl-embed-image-settings' ),
		clone = tpl.content.cloneNode( true );

	clone.querySelector( '.thumbnail img' ).src = data.url || '';
	clone.querySelector( '#embed-image-settings-alt-text' ).value = data.alt || '';
	
	if ( data.caption ) {
		captionEl = clone.querySelector( '#embed-image-settings-caption' );
		if ( captionEl ) {
			captionEl.value = data.caption;
		}
	}
	container.appendChild( clone );
};

/**
 * Render modal
 */
wp.media.renderMediaModal = function( container, data ) {
	var tpl = document.getElementById( 'tmpl-media-modal' ),
		clone = tpl.content.cloneNode( true ),
		closeButton = clone.querySelector( '.media-modal-close' );

	closeButton.hidden = ! data.hasCloseButton;
	closeButton.addEventListener( 'click', wp.media.closeModal );
	container.appendChild( clone );
};

wp.media.openModal = function() {
	var dialog = document.querySelector( '.media-modal' );
	if ( dialog ) {
		dialog.showModal();
	}
};

wp.media.closeModal = function() {
	var dialog = document.querySelector( '.media-modal' );
	if ( dialog ) {
		dialog.close();
	}
};

wp.media.renderEditAttachmentFrame = function( container, data ) {
	var tpl = document.getElementById( 'tmpl-edit-attachment-frame' ),
		clone = tpl.content.cloneNode( true );

	clone.querySelector( '.left' ).disabled = ! data.hasPrevious;
	clone.querySelector( '.right' ).disabled = ! data.hasNext;
	clone.querySelector( '.media-modal-close' ).addEventListener( 'click', wp.media.closeModal );
	container.appendChild( clone );
};

wp.media.renderUploaderInline = function( container, data ) {
	var tpl = document.getElementById( 'tmpl-uploader-inline' ),
		clone = tpl.content.cloneNode( true ),
		messageEl = clone.querySelector( '.upload-message' ),
		suggestedEl = clone.querySelector( '.suggested-dimensions' );

	clone.querySelector( '.close' ).hidden = ! data.canClose;
	if ( data.message ) {
		messageEl.textContent = data.message;
	} else {
		messageEl.hidden = true;
	}

	if ( suggestedEl && data.suggestedWidth && data.suggestedHeight ) {
		suggestedEl.textContent = cpMediaManagerL10n.suggestedDimensions.replace( '%1$s', data.suggestedWidth ).replace( '%2$s', data.suggestedHeight );
	}
	container.appendChild( clone );
};

wp.media.renderAttachment = function( container, data ) {
	var maybeReadOnly,
		tpl = document.getElementById( 'tmpl-attachment' ),
		clone = tpl.content.cloneNode( true ),
		preview = clone.querySelector( '.attachment-preview' ),
		progressBar = clone.querySelector( '.media-progress-bar' ),
		centered = clone.querySelector( '.centered' ),
		thumbImg = clone.querySelector( '.thumbnail-image' ),
		iconImg = clone.querySelector( '.icon-image' ),
		describeInput = clone.querySelector( '.describe' );

	// Type/subtype/orientation classes
	preview.classList.add( 'type-' + data.type );
	preview.classList.add( 'subtype-' + data.subtype );
	if ( data.orientation ) {
		preview.classList.add( data.orientation );
	}

	// Progress bar vs image/icon
	if ( data.uploading ) {
		centered.hidden = true;
		progressBar.querySelector( 'div' ).style.width = ( data.percent || 0 ) + '%';
	} else {
		progressBar.hidden = true;
		if ( data.type === 'image' && data.size && data.size.url ) {
			thumbImg.src = data.size.url;
			iconImg.hidden = true;
		} else {
			thumbImg.hidden = true;
			if ( data.image && data.image.src && data.image.src !== data.icon ) {
				iconImg.src = data.image.src;
				iconImg.classList.remove( 'icon' );
			} else if ( data.sizes && data.sizes.medium ) {
				iconImg.src = data.sizes.medium.url;
				iconImg.classList.remove( 'icon' );
			} else {
				iconImg.src = data.icon;
			}
		}
	}

	// Filename
	clone.querySelector( '.filename-text' ).textContent = data.filename;

	// Buttons
	clone.querySelector( '.attachment-close' ).hidden = ! data.buttons.close;
	clone.querySelector( '.check' ).hidden = ! data.buttons.check;

	// Describe input
	if ( data.describe ) {
		maybeReadOnly = ( data.can && data.can.save ) || data.allowLocalEdits ? '' : 'readonly';
		if ( maybeReadOnly ) {
			describeInput.setAttribute( 'readonly', '' );
		}
		if ( data.type === 'image' ) {
			describeInput.value = data.caption;
			describeInput.dataset.setting = 'caption';
			describeInput.setAttribute( 'aria-label', cpMediaManagerL10n.captionLabel );
			describeInput.placeholder = cpMediaManagerL10n.captionPlaceholder;
		} else {
			describeInput.value = data.title;
			describeInput.dataset.setting = 'title';
			if ( data.type === 'video' ) {
				describeInput.setAttribute( 'aria-label', cpMediaManagerL10n.videoTitleLabel );
				describeInput.placeholder = cpMediaManagerL10n.videoTitlePlaceholder;
			} else if ( data.type === 'audio' ) {
				describeInput.setAttribute( 'aria-label', cpMediaManagerL10n.audioTitleLabel );
				describeInput.placeholder = cpMediaManagerL10n.audioTitlePlaceholder;
			} else {
				describeInput.setAttribute( 'aria-label', cpMediaManagerL10n.mediaTitleLabel );
				describeInput.placeholder = cpMediaManagerL10n.mediaTitlePlaceholder;
			}
		}
	} else {
		describeInput.hidden = true;
	}

	container.appendChild( clone );
};

wp.media.renderAttachmentDetails = function( container, data ) {
	var origLink,
		tpl = document.getElementById( 'tmpl-attachment-details' ),
		clone = tpl.content.cloneNode( true ),
		progressBar = clone.querySelector( '.media-progress-bar' ),
		detailsImage = clone.querySelector( '.details-image' ),
		detailsIcon = clone.querySelector( '.details-icon' ),
		audioWrapper = clone.querySelector( '.wp-audio' ),
		videoWrapper = clone.querySelector( '.wp-video' ),
		dimensionsEl = clone.querySelector( '.dimensions' ),
		originalImageEl = clone.querySelector( '.original-image' ),
		editAttachmentEl = clone.querySelector( '.edit-attachment' ),
		fileLengthEl = clone.querySelector( '.file-length' ),
		mediaStatesEl = clone.querySelector( '.media-states' ),
		untrashBtn = clone.querySelector( '.untrash-attachment' ),
		trashBtn = clone.querySelector( '.trash-attachment' ),
		deleteBtn = clone.querySelector( '.delete-attachment' ),
		video = videoWrapper?.querySelector( 'video' ),
		maybeReadOnly = ( data.can && data.can.save ) || data.allowLocalEdits;

	// Thumbnail type class
	clone.querySelector( '.thumbnail-type' ).classList.add( 'thumbnail-' + data.type );

	// Progress bar vs preview
	progressBar.hidden  = true;
	detailsImage.hidden = true;
	detailsIcon.hidden  = true;
	audioWrapper.hidden = true;
	videoWrapper.hidden = true;

	if ( data.uploading ) {
		progressBar.hidden = false;
	} else if ( data.type === 'audio' ) {
		audioWrapper.querySelector( 'source' ).type = data.mime;
		audioWrapper.querySelector( 'source' ).src = data.url;
		audioWrapper.hidden = false;
	} else if ( data.type === 'video' ) {
		if ( data.width ) {
			video.width = data.width;
		}
		if ( data.height ) {
			video.height = data.height;
		}
		if ( data.image && data.image.src && data.image.src !== data.icon ) {
			video.poster = data.image.src;
		}
		videoWrapper.querySelector( 'source' ).type = data.mime;
		videoWrapper.querySelector( 'source' ).src  = data.url;
		if ( data.width ) {
			videoWrapper.style.width = data.width + 'px';
		} else if ( wp.media.view.settings.contentWidth ) {
			videoWrapper.style.width = wp.media.view.settings.contentWidth + 'px';
		}
		videoWrapper.hidden = false;
	} else if ( data.type === 'image' && data.size && data.size.url ) {
		detailsImage.src = data.size.url;
		detailsImage.hidden = false;
	} else {
		detailsIcon.src = data.icon;
		detailsIcon.hidden = false;
	}

	// Details
	clone.querySelector( '.filename' ).textContent = data.filename;
	clone.querySelector( '.uploaded' ).textContent = data.dateFormatted;
	clone.querySelector( '.file-size' ).textContent = data.filesizeHumanReadable;

	if ( data.type === 'image' && ! data.uploading && data.width && data.height ) {
		dimensionsEl.textContent = cpMediaManagerL10n.dimensions.replace( '%1$s', data.width ).replace( '%2$s', data.height );
	} else {
		dimensionsEl.hidden = true;
	}

	if ( data.originalImageURL && data.originalImageName ) {
		origLink = originalImageEl.querySelector( '.original-image-link' );
		origLink.href = data.originalImageURL;
		origLink.textContent = data.originalImageName;
	} else {
		originalImageEl.hidden = true;
	}

	if ( data.can && data.can.save && data.sizes ) {
		editAttachmentEl.href = data.editLink + '&image-editor';
	} else {
		editAttachmentEl.hidden = true;
	}

	if ( data.fileLength && data.fileLengthHumanReadable ) {
		clone.querySelector( '.file-length-formatted' ).textContent = data.fileLength;
		clone.querySelector( '.file-length-human-readable' ).textContent = data.fileLengthHumanReadable;
	} else {
		fileLengthEl.hidden = true;
	}

	if ( data.mediaStates ) {
		clone.querySelector( '.media-states-text' ).textContent = data.mediaStates;
	} else {
		mediaStatesEl.hidden = true;
	}

	if ( data.compat && data.compat.meta ) {
		clone.querySelector( '.compat-meta' ).innerHTML = data.compat.meta;
	}

	// Settings
	if ( ! maybeReadOnly ) {
		clone.querySelectorAll( 'textarea, input[type="text"]' ).forEach( function( el ) {
			el.setAttribute( 'readonly', '' );
		} );
	}

	clone.querySelector( '#attachment-details-alt-text' ).value = data.alt || '';
	if ( clone.querySelector( '#attachment-details-title' ) ) {
		clone.querySelector( '#attachment-details-title' ).value = data.title || '';
	}
	clone.querySelector( '#attachment-details-caption' ).value = data.caption || '';
	clone.querySelector( '#attachment-details-description' ).value = data.description || '';
	clone.querySelector( '#attachment-details-copy-link' ).value = data.url || '';

	// Trash/delete actions
	untrashBtn.hidden = true;
	trashBtn.hidden   = true;
	deleteBtn.hidden  = true;

	if ( ! data.uploading && data.can && data.can.remove ) {
		if ( window.MEDIA_TRASH ) {
			if ( data.status === 'trash' ) {
				untrashBtn.hidden = false;
			} else {
				trashBtn.hidden = false;
			}
		} else {
			deleteBtn.hidden = false;
		}
	}

	container.appendChild( clone );
};

wp.media.renderAttachmentDisplaySettings = function( container, data ) {
	var tpl = document.getElementById( 'tmpl-attachment-display-settings' ),
		clone = tpl.content.cloneNode( true ),
		linkLabel = clone.querySelector( '.link-to-label' ),
		optionFile = clone.querySelector( '.option-file' ),
		optionPost = clone.querySelector( '.option-post' ),
		linkSelect = clone.querySelector( '.link-to' ),
		sizeSpan = clone.querySelector( '.setting.size' );

	// Alignment — only shown for images
	clone.querySelector( '.setting.align' ).hidden = ( data.type !== 'image' );

	// Link-to label and options depend on canEmbed
	linkLabel.textContent = data.canEmbed	? cpMediaManagerL10n.embedOrLink : cpMediaManagerL10n.linkTo;

	// Show/hide options based on canEmbed
	clone.querySelector( '.option-embed' ).hidden = ! data.canEmbed;
	clone.querySelector( '.option-none' ).hidden  = data.canEmbed;

	optionFile.textContent = data.canEmbed ? cpMediaManagerL10n.linkToMediaFile : cpMediaManagerL10n.mediaFile;
	optionPost.textContent = data.canEmbed ? cpMediaManagerL10n.linkToAttachmentPage : cpMediaManagerL10n.attachmentPage;

	// Custom URL option — images only
	clone.querySelector( '.option-custom' ).hidden = ( data.type !== 'image' );

	// user-setting attribute on link-to select
	if ( data.userSettings && ! data.canEmbed ) {
		linkSelect.dataset.userSetting = 'urlbutton';
	}

	// Size select — only shown when sizes are available
	if ( typeof data.sizes === 'undefined' ) {
		sizeSpan.hidden = true;
	} else {
		// Populate size options with actual dimensions from data.sizes
		if ( data.userSettings ) {
			sizeSpan.querySelector( 'select' ).dataset.userSetting = 'imgsize';
		}
		sizeSpan.querySelectorAll( 'option[data-size-slug]' ).forEach( function( opt ) {
			var slug = opt.dataset.sizeSlug,
				size = data.sizes[ slug ];

			if ( size ) {
				opt.textContent = opt.textContent + ' \u2013 ' + size.width + '\u00d7' + size.height;
			} else {
				opt.hidden = true;
			}
		} );
	}

	container.appendChild( clone );
};

wp.media.renderGallerySettings = function( container, data ) {
	var sizeOpt,
		tpl = document.getElementById( 'tmpl-gallery-settings' ),
		clone = tpl.content.cloneNode( true ),
		linkSelect = clone.querySelector( '#gallery-settings-link-to' ),
		colSelect = clone.querySelector( '#gallery-settings-columns' ),
		sizeSelect = clone.querySelector( '#gallery-settings-size' ),
		defaults = wp.media.galleryDefaults,
		linkDefault = defaults.link || 'post',
		colDefault = String( defaults.columns || 3 );

	// Link-to default selection
	linkSelect.querySelector( 'option[value="' + linkDefault + '"]' ).selected = true;
	if ( data.userSettings ) {
		linkSelect.dataset.userSetting = 'urlbutton';
	}

	// Columns default selection
	colSelect.querySelector( 'option[value="' + colDefault + '"]' ).selected = true;

	// Size default selection
	if ( data.userSettings ) {
		sizeSelect.dataset.userSetting = 'imgsize';
	}
	if ( defaults.size ) {
		sizeOpt = sizeSelect.querySelector( 'option[value="' + defaults.size + '"]' );
		if ( sizeOpt ) {
			sizeOpt.selected = true;
		}
	}

	container.appendChild( clone );
};

wp.media.renderPlaylistSettings = function( container, data ) {
	var tpl = document.getElementById( 'tmpl-playlist-settings' ),
		clone = tpl.content.cloneNode( true );

	// Checked state driven by emptyModel
	clone.querySelectorAll( 'input[type="checkbox"]' ).forEach( function( el ) {
		el.checked = data.isEmpty;
	} );

	// Tracklist label: show one, hide the other
	clone.querySelector( '.label-audio' ).hidden = data.isVideo;
	clone.querySelector( '.label-video' ).hidden = ! data.isVideo;

	// Artist checkbox — audio only
	clone.querySelector( '[data-setting="artists"]' ).hidden = data.isVideo;

	container.appendChild( clone );
};

wp.media.renderEmbedLinkSettings = function( container ) {
	var tpl = document.getElementById( 'tmpl-embed-link-settings' ),
		clone = tpl.content.cloneNode( true );

	container.appendChild( clone );
};

wp.media.renderImageDetails = function( container, data ) {
	var tpl = document.getElementById( 'tmpl-image-details' ),
		clone = tpl.content.cloneNode( true ),
		captionEl = clone.querySelector( '#image-details-caption' ),
		attachmentSections = clone.querySelectorAll( '.attachment-only' );

	// Populate text fields
	clone.querySelector( '#image-details-alt-text' ).value = data.alt || '';

	if ( captionEl ) {
		captionEl.value = data.caption || '';
	}
	clone.querySelector( '#image-details-title-attribute' ).value = data.title || '';
	clone.querySelector( '#image-details-css-class' ).value = data.extraClasses || '';
	clone.querySelector( '#image-details-link-to-custom' ).value = data.linkUrl || '';
	clone.querySelector( '#image-details-link-rel' ).value = data.linkRel || '';
	clone.querySelector( '#image-details-link-css-class' ).value = data.linkClassName || '';
	clone.querySelector( '#image-details-link-target' ).checked = !! data.linkTargetBlank;
	clone.querySelector( '#image-details-size-width' ).value = data.customWidth || '';
	clone.querySelector( '#image-details-size-height' ).value = data.customHeight || '';

	// Preview image
	clone.querySelector( '.column-image img' ).src = data.url || '';

	// Attachment-only sections
	if ( data.hasAttachment ) {
		attachmentSections.forEach( function( el ) {
			el.hidden = false;
		} );

		if ( data.sizes ) {
			clone.querySelectorAll( 'option[data-size-slug]' ).forEach( function( opt ) {
				var slug = opt.dataset.sizeSlug,
					size = data.sizes[ slug ];

				if ( size ) {
					opt.textContent = opt.textContent + ' \u2013 ' + size.width + '\u00d7' + size.height;
				} else {
					opt.hidden = true;
				}
			} );
		}

		if ( data.userSettings ) {
			clone.querySelector( '#image-details-size' ).dataset.userSetting = 'imgsize';
		}

		clone.querySelector( '.option-file-url' ).hidden = true;
		clone.querySelector( '.option-custom-url' ).hidden = true;
		clone.querySelector( '.option-file-attachment' ).hidden = false;
		clone.querySelector( '.option-post-attachment' ).hidden = false;
	} else {
		clone.querySelector( '.option-file-attachment' ).hidden = true;
		clone.querySelector( '.option-post-attachment' ).hidden = true;
		clone.querySelector( '.option-file-url' ).hidden = false;
		clone.querySelector( '.option-custom-url' ).hidden = false;
	}

	// Link settings visibility
	clone.querySelector( '.link-settings' ).hidden = ( data.link === 'none' );

	// Custom size visibility
	clone.querySelector( '.custom-size' ).hidden = ( data.size !== 'custom' );

	// Advanced options visibility
	if ( window.getUserSetting( 'advImgDetails' ) === 'show' ) {
		var advSection = clone.querySelector( '.advanced-section' );
		advSection.classList.add( 'advanced-visible' );
		advSection.querySelector( '.advanced-settings' ).classList.remove( 'hidden' );
	}

	container.appendChild( clone );
};

wp.media.renderAudioDetails = function( container, data ) {
	var srcExt,
		tpl = document.getElementById( 'tmpl-audio-details' ),
		clone = tpl.content.cloneNode( true ),
		additionalEl = clone.querySelector( '.additional-audio-sources' ),
		buttonsEl = clone.querySelector( '.additional-source-buttons' ),
		html5types = {
			mp3: wp.media.view.settings.embedMimes.mp3,
			ogg: wp.media.view.settings.embedMimes.ogg
		},
		missing = {};

	// Show rows for sources that have values, track which html5 types are covered
	clone.querySelectorAll( '.audio-sources [data-setting]' ).forEach( function( row ) {
		var type = row.dataset.setting,
			value = data[ type ];

		if ( value ) {
			row.querySelector( 'input' ).value = value;
			row.hidden = false;
			if ( html5types[ type ] ) {
				delete html5types[ type ];
			}
		}
	} );

	// Primary src row
	if ( data.src ) {
		srcExt = data.src.split( '.' ).pop();
		if ( html5types[ srcExt ] ) {
			delete html5types[ srcExt ];
		}
	}

	// Build "add alternate source" buttons for any uncovered html5 types
	Object.keys( html5types ).forEach( function( type ) {
		var btn = document.createElement( 'button' );
		btn.className = 'button add-media-source';
		btn.dataset.mime = html5types[ type ];
		btn.textContent = type;
		buttonsEl.appendChild( btn );
		missing[ type ] = true;
	} );

	if ( Object.keys( missing ).length ) {
		additionalEl.hidden = false;
	}

	container.appendChild( clone );
};

wp.media.renderVideoDetails = function( container, data ) {
	var srcExt,
		tpl = document.getElementById( 'tmpl-video-details' ),
		clone = tpl.content.cloneNode( true ),
		video = clone.querySelector( 'video' ),
		additionalEl = clone.querySelector( '.additional-video-sources' ),
		buttonsEl = clone.querySelector( '.additional-source-buttons' ),
		posterEl = clone.querySelector( '.poster-image' ),
		w = data.width || 640,
		h = data.height || 360,
		html5types = {
			mp4:  wp.media.view.settings.embedMimes.mp4,
			ogv:  wp.media.view.settings.embedMimes.ogv,
			webm: wp.media.view.settings.embedMimes.webm,
			m4v:  wp.media.view.settings.embedMimes.m4v,
			wmv:  wp.media.view.settings.embedMimes.wmv,
			flv:  wp.media.view.settings.embedMimes.flv,
			'3gp': wp.media.view.settings.embedMimes[ '3gp' ]
		},
		missing = {};

	// Video dimensions
	if ( data.width && data.height ) {
		h = Math.ceil( h * w / data.width );
	}
	video.width = w;
	video.height = h;

	// Show rows for sources that have values
	clone.querySelectorAll( '.video-sources [data-setting]' ).forEach( function( row ) {
		var type = row.dataset.setting,
			value = data[ type ];

		if ( value ) {
			row.querySelector( 'input' ).value = value;
			row.hidden = false;
			if ( html5types[ type ] ) {
				delete html5types[ type ];
			}
		}
	} );

	if ( data.src ) {
		srcExt = data.src.split( '.' ).pop();
		if ( html5types[ srcExt ] ) {
			delete html5types[ srcExt ];
		}
	}

	// Build "add alternate source" buttons
	Object.keys( html5types ).forEach( function( type ) {
		var btn = document.createElement( 'button' );

		btn.className = 'button add-media-source';
		btn.dataset.mime = html5types[ type ];
		btn.textContent = type;
		buttonsEl.appendChild( btn );
		missing[ type ] = true;
	} );

	if ( Object.keys( missing ).length ) {
		additionalEl.hidden = false;
	}

	// Poster image
	if ( data.poster ) {
		posterEl.querySelector( 'input' ).value = data.poster;
		posterEl.hidden = false;
	}

	container.appendChild( clone );
};
