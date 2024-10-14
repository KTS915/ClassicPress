/**
 * @output wp-admin/js/widgets/media-widgets.js
 */

/*
 * @since CP 2.3.0
 */
document.addEventListener( 'DOMContentLoaded', function() {
	var pond, itemID, focusID, widgetID, acceptedFileTypes, urlForInsertion, altText, caption, linkType, linkToUrl,
		{ FilePond } = window, // import FilePond
		widgetType = 'media_image',
		changeMedia = false,
		mediaWidgets = document.querySelectorAll( '.media-widget-control' ),
		queryParams = new URLSearchParams( window.location.search ),
		inputElement = document.getElementById( 'filepond' ),
		ajaxurl	= document.getElementById( 'ajax-url' ).value,
		dialog = document.getElementById( 'widget-modal' ),
		closeButton = document.getElementById( 'media-modal-close' ),
		dateFilter = document.getElementById( 'filter-by-date' ),
		search = document.getElementById( 'media-search-input' ),
		mediaCatSelect = document.getElementById( 'taxonomy=media_category&term' ),
		mediaGrid = document.querySelector( '#media-grid ul' ),
		addButton = document.querySelector( '.media-button-insert' );

	// Update details within modal
	function setAddedMediaFields( id ) {
		var form = document.createElement( 'form' );
		form.className = 'compat-item';
		form.innerHTML = '<input type="hidden" id="menu-order" name="attachments[' + id + '][menu_order]" value="0">' +
			'<p class="media-types media-types-required-info"><span class="required-field-message">Required fields are marked <span class="required">*</span></span></p>' +
			'<span class="setting" data-setting="media_category">' +
				'<label for="attachments-' + id + '-media_category">' +
					'<span class="alignleft">Media Categories</span>' +
				'</label>' +
				'<input type="text" class="text" id="attachments-' + id + '-media_category" name="attachments[' + id + '][media_category]" value="">' +
			'</span>' +
			'<span class="setting" data-setting="media_post_tag">' +
				'<label for="attachments-' + id + '-media_post_tag">' +
					'<span class="alignleft">Media Tags</span>' +
				'</label>' +
				'<input type="text" class="text" id="attachments-' + id + '-media_post_tag" name="attachments[' + id + '][media_post_tag]" value="">' +
			'</span>';

		if ( document.querySelector( '.compat-item' ) != null ) {
			document.querySelector( '.compat-item' ).remove();
		}
		document.querySelector( '.attachment-compat' ).append( form );
	}

	// Update attachment details
	function updateDetails( input, id ) {
		var successTimeout,
			data = new FormData();

		data.append( 'action', 'save-attachment' );
		data.append( 'id', id );
		data.append( 'nonce', document.getElementById( 'media-' + id ).dataset.updateNonce );

		// Append metadata fields
		if ( input.parentNode.dataset.setting === 'alt' ) {
			data.append( 'changes[alt]', input.value );
		} else if ( input.parentNode.dataset.setting === 'title' ) {
			data.append( 'changes[title]', input.value );
		} else if ( input.parentNode.dataset.setting === 'caption' ) {
			data.append( 'changes[caption]', input.value );
		} else if ( input.parentNode.dataset.setting === 'description' ) {
			data.append( 'changes[description]', input.value );
		}

		fetch( ajaxurl, {
			method: 'POST',
			body: data,
			credentials: 'same-origin'
		} )
		.then( function( response ) {
			if ( response.ok ) {
				return response.json(); // no errors
			}
			throw new Error( response.status );
		} )
		.then( function( result ) {
			if ( result.success ) {

				// Update data attributes
				if ( input.parentNode.dataset.setting === 'alt' ) {
					document.getElementById( 'media-' + id ).querySelector( 'img' ).setAttribute( 'alt', input.value );
				} else if ( input.parentNode.dataset.setting === 'title' ) {
					document.getElementById( 'media-' + id ).setAttribute( 'aria-label', input.value );
				} else if ( input.parentNode.dataset.setting === 'caption' ) {
					document.getElementById( 'media-' + id ).setAttribute( 'data-caption', input.value );
				} else if ( input.parentNode.dataset.setting === 'description' ) {
					document.getElementById( 'media-' + id ).setAttribute( 'data-description', input.value );
				}

				// Show success visual feedback.
				clearTimeout( successTimeout );
				document.getElementById( 'details-saved' ).classList.remove( 'hidden' );
				document.getElementById( 'details-saved' ).setAttribute( 'aria-hidden', 'false' );

				// Hide success visual feedback after 3 seconds.
				successTimeout = setTimeout( function() {
					document.getElementById( 'details-saved' ).classList.add( 'hidden' );
					document.getElementById( 'details-saved' ).setAttribute( 'aria-hidden', 'true' );
				}, 3000 );
			} else {
				console.error( _wpMediaGridSettings.failed_update, result.data.error );
			}
		} )
		.catch( function( error ) {
			console.error( _wpMediaGridSettings.error, error );
		} );
	}

	// Update media categories and tags
	function updateMediaTaxOrTag( input, id ) {
		var successTimeout, newTaxes,
			data = new FormData(),
			taxonomy = input.getAttribute( 'name' ).replace( 'attachments[' + id + '][' , '' ).replace( ']', '' );

		data.append( 'action', 'save-attachment-compat' );
		data.append( 'nonce', document.getElementById( 'media-' + id ).dataset.updateNonce );
		data.append( 'id', id );
		data.append( 'taxonomy', taxonomy );
		data.append( 'attachments[' + id + '][' + taxonomy + ']', input.value );

		fetch( ajaxurl, {
			method: 'POST',
			body: data,
			credentials: 'same-origin'
		} )
		.then( function( response ) {
			if ( response.ok ) {
				return response.json(); // no errors
			}
			throw new Error( response.status );
		} )
		.then( function( result ) {
			if ( result.success ) {
				if ( taxonomy === 'media_category' ) {
					newTaxes = result.data.media_cats.join( ', ' );
					input.value = newTaxes;
					document.getElementById( 'media-' + id ).setAttribute( 'data-taxes', newTaxes );
				} else if ( taxonomy === 'media_tag' ) {
					newTaxes = result.data.media_tags.join( ', ' );
					input.value = newTaxes;
					document.getElementById( 'media-' + id ).setAttribute( 'data-tags', newTaxes );
				}
				
				// Show success visual feedback.
				clearTimeout( successTimeout );
				document.getElementById( 'tax-saved' ).classList.remove( 'hidden' );
				document.getElementById( 'tax-saved' ).setAttribute( 'aria-hidden', 'false' );

				// Hide success visual feedback after 3 seconds.
				successTimeout = setTimeout( function() {
					document.getElementById( 'tax-saved' ).classList.add( 'hidden' );
					document.getElementById( 'tax-saved' ).setAttribute( 'aria-hidden', 'true' );
				}, 3000 );
			} else {
				console.error( _wpMediaGridSettings.failed_update, result.data.error );
			}
		} )
		.catch( function( error ) {
			console.error( _wpMediaGridSettings.error, error );
		} );
	}

	// Delete attachment from within modal
	function deleteItem( id ) {
		var data = new URLSearchParams( {
			action: 'delete-post',
			_ajax_nonce: document.getElementById( 'media-' + id ).dataset.deleteNonce,
			id: id
		} );

		fetch( ajaxurl, {
			method: 'POST',
			body: data,
			credentials: 'same-origin'
		} )
		.then( function( response ) {
			if ( response.ok ) {
				return response.json(); // no errors
			}
			throw new Error( response.status );
		} )
		.then( function( result ) {
			if ( result === 1 ) { // success
				if ( document.getElementById( 'media-' + id ).previousElementSibling != null ) {
					focusID = document.getElementById( 'media-' + id ).previousElementSibling.id;
				} else if ( document.getElementById( 'media-' + id ).nextElementSibling != null ) {
					focusID = document.getElementById( 'media-' + id ).nextElementSibling.id;
				}
				document.getElementById( 'media-' + id ).remove();
				closeButton.click();
			} else {
				console.log( _wpMediaGridSettings.delete_failed );
			}
		} )
		.catch( function( error ) {
			console.error( _wpMediaGridSettings.error, error );
		} );
	}

	/* Select and unselect media items for adding to widget */
	function selectItemToAdd( item ) {
		var selectedItems = document.querySelectorAll( '.selected' ),
			sidebar = document.querySelector( '.media-sidebar' ),
			id = item.id.replace( 'media-', '' ),
			title = item.getAttribute( 'aria-label' ),
			date = item.dataset.date,
			filename = item.dataset.filename,
			filetype = item.dataset.filetype,
			size = item.dataset.size,
			width = item.dataset.width,
			height = item.dataset.height,
			caption = item.dataset.caption,
			description = item.dataset.description,
			taxes = item.dataset.taxes,
			tags = item.dataset.tags,
			url = item.dataset.url,
			alt = item.querySelector( 'img' ).getAttribute( 'alt' ),
			link = item.dataset.link,
			prev = item.previousElementSibling ? item.previousElementSibling.id : '',
			next = item.nextElementSibling ? item.nextElementSibling.id : '';

		// Set menu_order, media_category, and media_post_tag field IDs correctly
		setAddedMediaFields( id );

		// Populate modal with attachment details
		sidebar.querySelector( '.attachment-date' ).textContent = date;
		sidebar.querySelector( '.attachment-filename' ).textContent = filename;
		sidebar.querySelector( '.attachment-filesize' ).textContent = size;
		sidebar.querySelector( '.attachment-dimensions' ).textContent = width + ' ' + _wpMediaGridSettings.by + ' ' + height + ' ' + _wpMediaGridSettings.pixels;
		sidebar.querySelector( '#edit-more' ).href = ajaxurl.replace( 'admin-ajax.php', 'post.php?post=' + id + '&action=edit' );

		sidebar.querySelector( '#attachment-details-two-column-alt-text').textContent = alt;
		sidebar.querySelector( '#attachment-details-two-column-title').value = title;
		sidebar.querySelector( '#attachment-details-two-column-caption').textContent = caption;
		sidebar.querySelector( '#attachment-details-two-column-description').textContent = description;
		sidebar.querySelector( '#attachment-details-two-column-copy-link').value = url;

		sidebar.querySelector( '#attachments-' + id + '-media_category').value = taxes;
		sidebar.querySelector( '#attachments-' + id + '-media_post_tag').value = tags;

		sidebar.querySelector( '.attachment-details' ).style.display = 'block';

		// Delete media item
		sidebar.querySelector( '.delete-attachment' ).addEventListener( 'click', function() {
			if ( confirm( _wpMediaGridSettings.confirm_delete ) ) {
				deleteItem( id );
			}
		} );
			
		/* Update media attachment details */
		sidebar.querySelectorAll( '.settings input, .settings textarea' ).forEach( function( input ) {
			input.addEventListener( 'blur', function() {
				if ( input.parentNode.parentNode.className === 'compat-item' ) {
					updateMediaTaxOrTag( input, id ); // Update media categories and tags
				} else {
					updateDetails( input, id );
				}
			} );
		} );

		/* Add item(s) to widget */
		if ( item.className.includes( 'selected' ) ) {
			item.classList.remove( 'selected' );
			item.setAttribute( 'aria-checked', false );

			// Disable add to widget button if no media items are selected
			if ( document.querySelector( '.media-item.selected' ) == null ) {
				addButton.setAttribute( 'disabled', true );
				sidebar.querySelector( '.attachment-details' ).style.display = 'none';
			}
		} else {
			// Prevent selection of multiple items unless it's for the Gallery widget
			if ( selectedItems.length && widgetType !== 'media_gallery' ) {
				selectedItems.forEach( function( selectedItem ) {
					selectedItem.classList.remove( 'selected' );
					selectedItem.setAttribute( 'aria-checked', false );
				} );
			}

			item.classList.add( 'selected' );
			item.setAttribute( 'aria-checked', true );

			// Enable add to widget button
			if ( addButton.disabled ) {
				addButton.removeAttribute( 'disabled' );
			}
		}
	}

	/* Populate media items within grid */
	function populateGridItem( attachment ) {
		var gridItem = document.createElement( 'li' ),
			image = '<img src="' + attachment.url + '" alt="' + attachment.alt + '">';

		if ( attachment.type === 'application' ) {
			if ( attachment.subtype === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet' ) {
				image = '<div class="icon"><div class="centered"><img src="' + _wpMediaGridSettings.includes_url + 'images/media/spreadsheet.png' + '" draggable="false" alt=""></div><div class="filename"><div>' + attachment.title + '</div></div></div>';
			} else if ( attachment.subtype === 'zip' ) {
				image = '<div class="icon"><div class="centered"><img src="' + _wpMediaGridSettings.includes_url + 'images/media/archive.png' + '" draggable="false" alt=""></div><div class="filename"><div>' + attachment.title + '</div></div></div>';
			} else {
				image = '<div class="icon"><div class="centered"><img src="' + _wpMediaGridSettings.includes_url + 'images/media/document.png' + '" draggable="false" alt=""></div><div class="filename"><div>' + attachment.title + '</div></div></div>';
			}
		} else if ( attachment.type === 'audio' ) {
			image = '<div class="icon"><div class="centered"><img src="' + _wpMediaGridSettings.includes_url + 'images/media/audio.png' + '" draggable="false" alt=""></div><div class="filename"><div>' + attachment.title + '</div></div></div>';
		} else if ( attachment.type === 'video' ) {
			image = '<div class="icon"><div class="centered"><img src="' + _wpMediaGridSettings.includes_url + 'images/media/video.png' + '" draggable="false" alt=""></div><div class="filename"><div>' + attachment.title + '</div></div></div>';
		}	

		gridItem.className = 'media-item';
		gridItem.id = 'media-' + attachment.id;
		gridItem.setAttribute( 'tabindex', 0 );
		gridItem.setAttribute( 'role', 'checkbox' );
		gridItem.setAttribute( 'aria-checked', 'false' );
		gridItem.setAttribute( 'aria-label', attachment.title );
		gridItem.setAttribute( 'data-date', attachment.dateFormatted );
		gridItem.setAttribute( 'data-url', attachment.url );
		gridItem.setAttribute( 'data-filename', attachment.filename );
		gridItem.setAttribute( 'data-filetype', attachment.type );
		gridItem.setAttribute( 'data-mime', attachment.mime );
		gridItem.setAttribute( 'data-width', attachment.width );
		gridItem.setAttribute( 'data-height', attachment.height );
		gridItem.setAttribute( 'data-size', attachment.filesizeHumanReadable )
		gridItem.setAttribute( 'data-caption', attachment.caption );
		gridItem.setAttribute( 'data-description', attachment.description );
		gridItem.setAttribute( 'data-link', attachment.link );
		gridItem.setAttribute( 'data-orientation', attachment.orientation );
		gridItem.setAttribute( 'data-menu-order', attachment.menuOrder );
		gridItem.setAttribute( 'data-taxes', attachment.media_cats );
		gridItem.setAttribute( 'data-tags', attachment.media_tags );
		gridItem.setAttribute( 'data-update-nonce', attachment.nonces.update );
		gridItem.setAttribute( 'data-delete-nonce', attachment.nonces.delete );
		gridItem.setAttribute( 'data-edit-nonce', attachment.nonces.edit );

		gridItem.innerHTML = '<div class="select-attachment-preview type-' + attachment.type + ' subtype-' + attachment.subtype + '">' + 
			'<div class="media-thumbnail">' + image + '</div>' +
			'</div>' +
			'<button type="button" class="check" tabindex="-1">' +
			'<span class="media-modal-icon"></span>' +
			'<span class="screen-reader-text">' + _wpMediaGridSettings.deselect + '></span>' +
			'</button>';

		return gridItem;
	}

	/* Update items displayed according to dropdown selections */
	function updateGrid() {
		var date  = dateFilter.value,
			count = document.querySelector( '.load-more-count' ).textContent,
			type  = 'image';

		if ( widgetType === 'media_audio' ) {
			type = 'audio';
		} else if ( widgetType === 'media_video' ) {
			type = 'video';
		}

		// Create URLSearchParams object
		const params = new URLSearchParams( {
			'action': 'query-attachments',
			'query[posts_per_page]': 80, //document.getElementById( 'media_grid_per_page' ).value,
			'query[monthnum]': date ? parseInt( date.substr( 4, 2 ), 10 ) : 0,
			'query[year]': date ? parseInt( date.substr( 0, 4 ), 10 ) : 0,
			'query[post_mime_type]': type,
			'query[s]': search ? search.value : '',
			'query[media_category_name]': mediaCatSelect ? mediaCatSelect.value : '',
			'_ajax_nonce': document.getElementById( 'media_grid_nonce' ).value,
		} );

		// Make AJAX request
		fetch( ajaxurl, {
			method: 'POST',
			body: params,
			credentials: 'same-origin'
		} )
		.then( function( response ) {
			if ( response.ok ) {
				return response.json(); // no errors
			}
			throw new Error( response.status );
		} )
		.then( function( result ) {
			if ( result.success ) {
				if ( result.data.length === 0 ) {

					// Clear existing grid
					mediaGrid.innerHTML = '';

					// Update the count at the bottom of the page
					document.querySelector( '.load-more-count' ).setAttribute( 'hidden', true );
					document.querySelector( '.no-media' ).removeAttribute( 'hidden' );
				} else {

					// Clear existing grid
					mediaGrid.innerHTML = '';

					// Populate grid with new items
					result.data.forEach( function( attachment ) {
						var gridItem = populateGridItem( attachment );
						mediaGrid.appendChild( gridItem );
					} );

					// Open modal to show details about file, or select files for deletion
					document.querySelectorAll( '.media-item' ).forEach( function( item ) {
						item.addEventListener( 'click', function() {
							selectItemToAdd( item );
						} );
					} );

					// Update the count at the bottom of the page
					document.querySelector( '.no-media' ).setAttribute( 'hidden', true );
					document.querySelector( '.load-more-count' ).removeAttribute( 'hidden' );
					document.querySelector( '.load-more-count' ).textContent = count.replace( /[0-9]+/g, result.data.length );
				}
			} else {
				console.error( _wpMediaGridSettings.failed_update, result.data.message );
			}
		} )
		.catch( function( error ) {
			console.error( _wpMediaGridSettings.error, error );
		} );
	}

	function removeImageEditWrap() {
		if ( document.querySelector( '.imgedit-wrap' ) != null ) {
			document.querySelector( '.imgedit-wrap' ).remove();
			document.querySelector( '.attachment-details' ).removeAttribute( 'hidden' );
			document.querySelector( '.attachment-details' ).removeAttribute( 'inert' );
		}
	}

	/* Organize each media widget when first created */
	document.addEventListener( 'widget-added', function( event ) {
		var widget = event.detail.widget;

		// Only apply the following code if this is a media widget
		if ( widget.querySelector( '.media-widget-control' ) != null ) {

			// Enable selection of media for widget
			widget.querySelector( '.select-media' ).addEventListener( 'click', function( e ) {
				if ( e.target.className.includes( 'change-media' ) ) {
					changeMedia = true;
				}
				widgetID = e.target.closest( 'li' ).id;
				widgetType = e.target.parentNode.previousElementSibling.className.replace( 'media-widget-preview ', '' );
				updateGrid();
				dialog.showModal();
			} );
		}
	} );

	// Add event listeners for changing the selection of items displayed
	dateFilter.addEventListener( 'change', updateGrid );
	mediaCatSelect.addEventListener( 'change', updateGrid );
	search.addEventListener( 'input', function() {
		var searchtimer;
		clearTimeout( searchtimer );
		searchtimer = setTimeout( updateGrid, 200 );
	} );

	// Open modal to select item(s) to add to widget
	document.addEventListener( 'click', function( e ) {
		var widget, heading, insert, filepondBrowser, clonedImage,
			embedTab, embedMediaSettings, embedUrlField, options;

		if ( e.target.className.includes( 'select-media' ) && ( e.target.parentNode.className === 'media-widget-buttons' || e.target.parentNode.className === 'attachment-media-view' ) ) {
			if ( e.target.className.includes( 'change-media' ) ) {
				changeMedia = true;
			}

			widget = e.target.closest( 'li' ),
			widgetID = widget.id;
			heading = dialog.querySelector( 'h2' );
			insert = dialog.querySelector( '#menu-item-insert' );
			embedTab = dialog.querySelector( '#menu-item-embed' ),
			embedMediaSettings = dialog.querySelector( '#embed-media-settings' )
			embedUrlField = dialog.querySelector( '#embed-url-field' ),
			options = dialog.querySelectorAll( '#link-to option' );
			filepondBrowser = dialog.querySelector( '.filepond--browser' );
			widgetType = e.target.parentNode.previousElementSibling.className.replace( 'media-widget-preview ', '' );

			// Set correct labels and file types
			// Image widget
			if ( widgetType === 'media_image' ) {
				heading.textContent = 'Add Image';
				insert.textContent = 'Add Image';
				acceptedFileTypes = 'image/jpeg,image/gif,image/png,image/bmp,image/tiff,image/webp,image/x-icon,image/heic';
				inputElement.setAttribute( 'accept', acceptedFileTypes );
				filepondBrowser.setAttribute( 'accept', acceptedFileTypes );
				embedTab.style.display = '';
				embedMediaSettings.removeAttribute( 'hidden' );
				if ( changeMedia === true ) {
					clonedImage = widget.querySelector( 'img' ).cloneNode( true );
					dialog.querySelector( '.thumbnail' ).append( clonedImage );

					embedUrlField.value = widget.querySelector( 'img' ).src;
					dialog.querySelector( '#embed-image-settings-alt-text' ).value = widget.querySelector( 'img' ).getAttribute( 'alt' );

					if ( widget.querySelector( 'figcaption' ) != null ) {
						caption = widget.querySelector( 'figcaption' ).textContent;
						dialog.querySelector( '#embed-image-settings-caption' ).value = caption;
					}

					linkType = widget.querySelector( 'input[data-link-type="link_type"]' ).value;
					dialog.querySelector( '#link-to' ).value = linkType;

					options.forEach( function( option ) {
						if ( option.hasAttribute( 'selected' ) ) {
							option.removeAttribute( 'selected' );
						}
					} );

					options.forEach( function( option ) {
						if ( option.value === linkType ) {
							option.setAttribute( 'selected', true );
						}
					} );

					linkToUrl = widget.querySelector( 'input[data-link-url="link_url"]' ).value;
					dialog.querySelector( '#embed-image-settings-link-to-custom' ).value = linkToUrl;
				}

			// Audio widget
			} else if ( widgetType === 'media_audio' ) {
				heading.textContent = 'Add Audio';
				insert.textContent = 'Add Audio';
				acceptedFileTypes = 'audio/mpeg,audio/aac,audio/x-realaudio,audio/wav,audio/ogg,audio/flac,audio/midi,audio/x-ms-wma,audio/x-ms-wax,audio/x-matroska';
				inputElement.setAttribute( 'accept', acceptedFileTypes );
				filepondBrowser.setAttribute( 'accept', acceptedFileTypes );
				embedTab.style.display = '';
				embedMediaSettings.setAttribute( 'hidden', true );
				if ( changeMedia === true ) {
					embedUrlField.value = widget.querySelector( 'audio a' ).href;
				}

			// Video widget
			} else if ( widgetType === 'media_video' ) {
				heading.textContent = 'Add Video';
				insert.textContent = 'Add Video';
				acceptedFileTypes = 'video/x-ms-asf,video/x-ms-wmv,video/x-ms-wmx,video/x-ms-wm,video/avi,video/divx,video/x-flv,video/quicktime,video/mpeg,video/mp4,video/ogg,video/webm,video/x-matroska,video/3gpp,video/3gpp2';
				inputElement.setAttribute( 'accept', acceptedFileTypes );
				filepondBrowser.setAttribute( 'accept', acceptedFileTypes );
				embedTab.style.display = '';
				embedMediaSettings.setAttribute( 'hidden', true );
				if ( changeMedia === true ) {
					embedUrlField.value = widget.querySelector( 'video a' ).href;
				}

			// Gallery widget
			} else if ( widgetType === 'media_gallery' ) {
				heading.textContent = 'Create Gallery';
				insert.textContent = 'Create Gallery';
				acceptedFileTypes = 'image/jpeg,image/gif,image/png,image/bmp,image/tiff,image/webp,image/x-icon,image/heic';
				inputElement.setAttribute( 'accept', acceptedFileTypes );
				filepondBrowser.setAttribute( 'accept', acceptedFileTypes );
				embedTab.style.display = 'none';
			}

			updateGrid();
			dialog.showModal();
		}
	} );

	// Show correct modal content according to which combination of tabs is clicked
	document.addEventListener( 'click', function( e ) {
		var uploadTab = dialog.querySelector( '#menu-item-upload' ),
			uploaderPanel = dialog.querySelector( '#uploader-inline' ),
			browseTab = dialog.querySelector( '#menu-item-browse' ),
			browserPanel = dialog.querySelector( '#attachments-browser' ),
			insertTab = dialog.querySelector( '#menu-item-insert' ),
			mediaFramePanel = dialog.querySelector( '#media-frame-tab-panel' ),
			embedTab = dialog.querySelector( '#menu-item-embed' ),
			insertFromUrlPanel = dialog.querySelector( '#insert-from-url-panel' ),
			title1 = dialog.querySelector( '#media-frame-title' ),
			title2 = dialog.querySelector( '#media-frame-title-2' );

		// Media Library Grid
		if ( e.target === uploadTab ) {
			browseTab.classList.remove( 'active' );
			browseTab.setAttribute( 'aria-selected', false );
			uploadTab.classList.add( 'active' );
			uploadTab.setAttribute( 'aria-selected', true );
			browserPanel.setAttribute( 'hidden', true );
			browserPanel.setAttribute( 'inert', true );
			uploaderPanel.removeAttribute( 'hidden' );
			uploaderPanel.removeAttribute( 'inert' );

		// Upload File
		} else if ( e.target === browseTab ) {
			uploadTab.classList.remove( 'active' );
			uploadTab.setAttribute( 'aria-selected', false );
			browseTab.classList.add( 'active' );
			browseTab.setAttribute( 'aria-selected', true );
			uploaderPanel.setAttribute( 'hidden', true );
			uploaderPanel.setAttribute( 'inert', true );
			browserPanel.removeAttribute( 'hidden' );
			browserPanel.removeAttribute( 'inert' );

		// Add Image, Audio, or Video
		} else if ( e.target === insertTab ) {
			embedTab.classList.remove( 'active' );
			embedTab.setAttribute( 'aria-selected', false );
			title2.style.display = 'none';
			title1.style.display = '';
			insertTab.classList.add( 'active' );
			insertTab.setAttribute( 'aria-selected', true );
			insertFromUrlPanel.setAttribute( 'hidden', true );
			insertFromUrlPanel.setAttribute( 'inert', true );
			mediaFramePanel.removeAttribute( 'hidden' );
			mediaFramePanel.removeAttribute( 'inert' );

		// Insert From URL
		} else if ( e.target === embedTab ) {
			insertTab.classList.remove( 'active' );
			insertTab.setAttribute( 'aria-selected', false );
			title1.style.display = 'none';
			title2.style.display = '';
			embedTab.classList.add( 'active' );
			embedTab.setAttribute( 'aria-selected', true );
			mediaFramePanel.setAttribute( 'hidden', true );
			mediaFramePanel.setAttribute( 'inert', true );
			insertFromUrlPanel.removeAttribute( 'hidden' );
			insertFromUrlPanel.removeAttribute( 'inert' );
			urlForInsertion = dialog.querySelector( '#embed-url-field' ).value;
			altText = dialog.querySelector( '#embed-image-settings-alt-text' ).value;
			caption = dialog.querySelector( '#embed-image-settings-caption' ).value;
			linkType = dialog.querySelector( '#link-to' ).value;
			linkToUrl = dialog.querySelector( '#link-to-url' ).value;
		}

		insertFromUrlPanel.querySelector( '#embed-url-field' ).addEventListener( 'change', function( evt ) {
			urlForInsertion = evt.target.value;
			if ( addButton.disabled ) {
				addButton.removeAttribute( 'disabled' );
			}
		} );

		insertFromUrlPanel.querySelector( '#embed-image-settings-alt-text' ).addEventListener( 'change', function( evt ) {
			altText = evt.target.value;
			if ( addButton.disabled ) {
				addButton.removeAttribute( 'disabled' );
			}
		} );

		insertFromUrlPanel.querySelector( '#embed-image-settings-caption' ).addEventListener( 'change', function( evt ) {
			caption = evt.target.value;
			if ( addButton.disabled ) {
				addButton.removeAttribute( 'disabled' );
			}
		} );

		insertFromUrlPanel.querySelector( '#link-to' ).addEventListener( 'change', function( evt ) {
			var options = evt.target.querySelectorAll( 'option' ),
				linkToField = insertFromUrlPanel.querySelector( '#link-to-url' );

			linkType = evt.target.value;

			options.forEach( function( option ) {
				if ( option.hasAttribute( 'selected' ) ) {
					option.removeAttribute( 'selected' );
				}
			} );

			options.forEach( function( option ) {
				if ( option.value === linkType ) {
					option.setAttribute( 'selected', true );
				}
			} );

			linkToUrl = '';
			if ( linkType === 'custom' ) {
				linkToField.removeAttribute( 'hidden' );
				linkToField.removeAttribute( 'inert' );
			} else if ( linkType === 'file' ) {
				linkToUrl = urlForInsertion;
				linkToField.setAttribute( 'hidden', true );
				linkToField.setAttribute( 'inert', true );
			} else {
				linkToUrl = '';
				linkToField.setAttribute( 'hidden', true );
				linkToField.setAttribute( 'inert', true );
			}

			if ( addButton.disabled ) {
				addButton.removeAttribute( 'disabled' );
			}
		} );

		insertFromUrlPanel.querySelector( '#embed-image-settings-link-to-custom' ).addEventListener( 'change', function( evt ) {
			linkToUrl = evt.target.value;
			if ( addButton.disabled ) {
				addButton.removeAttribute( 'disabled' );
			}
		} );
	} );

	// Ensure that video has the appropriate dimensions after a video widget is updated
	document.addEventListener( 'widget-updated', function( e ) {
		var videoShortcode = e.detail.widget.querySelector( '.wp-video-shortcode' );
		if ( videoShortcode != null ) {
			videoShortcode.setAttribute( 'width', '' );
			videoShortcode.setAttribute( 'height', '' );
		}
	} );

	// Set functions for Escape and Enter keys
	document.addEventListener( 'keyup', function( e ) {
		var widget = document.getElementById( widgetID );
		if ( e.key === 'Escape' ) {
			changeMedia = false;
			widget.querySelector( 'details' ).open = true;
			widget.querySelector( '.select-media' ).focus();
		} else if ( e.key === 'Enter' && e.target.className === 'media-item' ) {
			e.target.click(); // open modal
		}
	} );

	/* Select item(s) to add to widget */
	document.querySelectorAll( '.media-item' ).forEach( function( item ) {
		item.addEventListener( 'click', function() {
			selectItemToAdd( item );
		} );
	} );

	/* Add item(s) to widget */
	addButton.addEventListener( 'click', function() {
		var addedElement, source,
			widget = document.getElementById( widgetID ),
			preview = widget.querySelector( '.media-widget-preview' );

		// Add audio, video, or image from URL
		if ( ! dialog.querySelector( '#insert-from-url-panel' ).hasAttribute( 'hidden' ) ) {

			if ( changeMedia === true ) {
				preview.innerHTML = '';
			} else {				
				preview.classList.add( widgetType );
				preview.classList.add( 'populated' );
			}

			// Add audio or video
			if ( widgetType === 'media_audio' || widgetType === 'media_video') {
				if ( widgetType === 'media_audio' ) {
					addedElement = document.createElement( 'audio' );
				} else if ( widgetType === 'media_video' ) {
					addedElement = document.createElement( 'video' );
				}

				addedElement.className = 'mejs-mediaelement';
				addedElement.controls = true;
				addedElement.src = urlForInsertion;

				// Create source element
				source = document.createElement( 'source' );
				source.src = urlForInsertion;

				// Append source to audio
				addedElement.append( source );

			// Add image
			} else if ( widgetType === 'media_image' ) {
				addedElement = document.createElement( 'img' );
				addedElement.src = urlForInsertion;
				addedElement.className = 'attachment-thumbnail';
				widget.querySelector( 'input[data-property="alt_text"]' ).value = altText ? altText : '';
				widget.querySelector( 'input[data-property="caption"]' ).value = caption ? caption : '';
				widget.querySelector( 'input[data-property="link_type"]' ).value = linkType ? linkType : 'none';
				widget.querySelector( 'input[data-property="link_url"]' ).value = linkToUrl ? linkToUrl : '';
			}

			if ( widget.querySelector( '.attachment-media-view' ) != null ) {
				widget.querySelector( '.attachment-media-view' ).remove();
			}

			preview.append( addedElement );
			widget.querySelector( 'input[data-property="url"]' ).value = urlForInsertion;
			document.getElementById( widgetID ).classList.add( 'widget-dirty' );
			widget.dispatchEvent( new Event( 'change' ) );

		// Add audio, video, or image from Media Library
		} else {
			document.querySelectorAll( '.media-item.selected' ).forEach( function( selectedItem ) {
				var modalSidebar = dialog.querySelector( '.media-sidebar' );

				if ( changeMedia === true ) {
					preview.innerHTML = '';
				} else {				
					preview.classList.add( widgetType );
					preview.classList.add( 'populated' );
				}

				// Add audio or video
				if ( widgetType === 'media_audio' || widgetType === 'media_video') {
					if ( widgetType === 'media_audio' ) {
						addedElement = document.createElement( 'audio' );
					} else if ( widgetType === 'media_video' ) {
						addedElement = document.createElement( 'video' );
					}
					addedElement.className = 'mejs-mediaelement';
					addedElement.controls = true;
					addedElement.src = selectedItem.dataset.url;

					// Create source element
					source = document.createElement( 'source' );
					source.src = selectedItem.dataset.url;
					source.type = selectedItem.dataset.mime;

					// Append source to audio
					addedElement.append( source );

				// Add image
				} else {
					addedElement = selectedItem.querySelector( 'img' );
					addedElement.className = 'attachment-thumb';
				}

				if ( widget.querySelector( '.attachment-media-view' ) != null ) {
					widget.querySelector( '.attachment-media-view' ).remove();
				}

				// Add values to widget-content fields
				if ( widgetType === 'media_audio' || widgetType === 'media_video' ) {					
					widget.querySelector( 'input[data-property="attachment_id"]' ).value = selectedItem.id.replace( 'media-', '' );
				} else if ( widgetType === 'media_image' || widgetType === 'media_gallery' ) {
					widget.querySelector( 'input[data-property="attachment_id"]' ).value = selectedItem.id.replace( 'media-', '' );
					widget.querySelector( 'input[data-property="size"]' ).value = modalSidebar.querySelector( '.size' ).value;
					widget.querySelector( 'input[data-property="link_type"]' ).value = modalSidebar.querySelector( '.link-to' ).value;
					widget.querySelector( 'input[data-property="link_url"]' ).value = modalSidebar.querySelector( '.link-to-custom' ).value;
					widget.querySelector( 'input[data-property="caption"]' ).value = modalSidebar.querySelector( '#attachment-details-two-column-caption' ).textContent;
					widget.querySelector( 'input[data-property="alt_text"]' ).value = modalSidebar.querySelector( '#attachment-details-two-column-alt-text' ).textContent;
				}

				preview.append( addedElement );
				widget.dispatchEvent( new Event( 'change' ) );
			} );
		}
		closeButton.click();
	} );


/*
 * $('.select-images').click(function(e) {
                e.preventDefault();
                var button = $(this);
                var customUploader = wp.media({
                    title: 'Select Images',
                    button: {
                        text: 'Use these images'
                    },
                    multiple: true
                }).on('select', function() {
                    var attachments = customUploader.state().get('selection').map(function(attachment) {
                        attachment = attachment.toJSON();
                        return attachment.id;
                    });
                    button.siblings('input[name*="attachment_ids"]').val(attachments.join(','));
                    updateGalleryPreview(button.siblings('.gallery-preview'), attachments);
                }).open();
            });

            function updateGalleryPreview(previewDiv, attachmentIds) {
                previewDiv.empty();
                attachmentIds.forEach(function(id) {
                    wp.media.attachment(id).fetch().then(function() {
                        var url = wp.media.attachment(id).get('url');
                        previewDiv.append('<img src="' + url + '" style="width: 50px; height: 50px; object-fit: cover; margin: 2px;">');
                    });
                });
            }
            */



	/* Close modal by clicking button */
	closeButton.addEventListener( 'click', function() {
		var selectMedia = document.getElementById( widgetID ).querySelector( '.select-media' );

		changeMedia = false;

		dialog.classList.remove( 'modal-loading' );
		dialog.close();

		// Set focus correctly
		if ( widgetID != null ) {
			if ( selectMedia != null ) {
				selectMedia.focus();
			} else {
				document.getElementById( widgetID ).querySelector( '.widget-control-save' ).focus();
			}
		} else {
			document.getElementById( focusID ).focus();
		}
		removeImageEditWrap();
	} );


	/**
	 * Copies the attachment URL to the clipboard.
	 *
	 * @since CP-2.2.0
	 *
	 * @param {MouseEvent} event A click event.
	 *
	 * @return {void}
	 */
	if ( document.querySelector( '.copy-attachment-url' ) != null ) {
		document.querySelector( '.copy-attachment-url' ).addEventListener( 'click', function( e ) {
			var successTimeout,
				copyText = e.target.parentNode.previousElementSibling.value,
				input = document.createElement( 'input' );

			if ( navigator.clipboard ) {
				navigator.clipboard.writeText( copyText );
			} else {
				document.body.append( input );
				input.value = copyText;
				input.select();
				document.execCommand( 'copy' );
			}

			// Show success visual feedback.
			clearTimeout( successTimeout );
			e.target.nextElementSibling.classList.remove( 'hidden' );
			e.target.nextElementSibling.setAttribute( 'aria-hidden', 'false' );
			input.remove();

			// Hide success visual feedback after 3 seconds since last success and unfocus the trigger.
			successTimeout = setTimeout( function() {
				e.target.nextElementSibling.classList.add( 'hidden' );
				e.target.nextElementSibling.setAttribute( 'aria-hidden', 'true' );
			}, 3000 );
		
		} );
	}

	/* Upload files using FilePond */
	// Register FilePond plugins
	FilePond.registerPlugin(
		FilePondPluginFileValidateSize,
		FilePondPluginFileValidateType,
		FilePondPluginFileRename,
		FilePondPluginImagePreview
	);

	// Create a FilePond instance
	pond = FilePond.create( inputElement, {
		allowMultiple: false,
		server: {
			process: function( fieldName, file, metadata, load, error, progress, abort, transfer, options ) {

				// Create FormData
				var formData = new FormData();
				formData.append( 'async-upload', file, file.name );
				formData.append( 'action', 'upload-attachment' );
				formData.append( '_wpnonce', document.getElementById( '_wpnonce' ).value );

				// Use Fetch to upload the file
				fetch( ajaxurl, {
					method: 'POST',
					body: formData,
					credentials: 'same-origin'
				} )
				.then( function( response ) {
					if ( response.ok ) {
						return response.json(); // no errors
					}
					throw new Error( response.status );
				} )
				.then( function( result ) {
					var gridItem;
					if ( result.success ) {
						load( result.data );						
						gridItem = populateGridItem( result.data );
						mediaGrid.prepend( gridItem );
					} else {
						error( _wpMediaGridSettings.upload_failed );
					}
				} )
				.catch( function( err ) {
					error( _wpMediaGridSettings.upload_failed );
					console.error( _wpMediaGridSettings.error, err );
				} );

				// Return an abort function
				return {
					abort: function() {
						// This function is called when the user aborts the upload
						abort();
					}
				};
			},
			maxFileSize: document.getElementById( 'filepond' ).dataset.maxFileSize,
		},
		labelTapToUndo: _wpMediaGridSettings.tap_close,
		fileRenameFunction: ( file ) =>
			new Promise( function( resolve ) {
				resolve( window.prompt( _wpMediaGridSettings.new_filename, file.name ) );
			} ),
		acceptedFileTypes: acceptedFileTypes ? acceptedFileTypes.split( ',' ) : [],
		labelFileTypeNotAllowed: _wpMediaGridSettings.invalid_type,
		fileValidateTypeLabelExpectedTypes: _wpMediaGridSettings.check_types,
	} );

} );
