/**
 * @output wp-admin/js/widgets/media-widgets.js
 */

/*
 * @since CP 2.3.0
 */
document.addEventListener( 'DOMContentLoaded', function() {
	var pond, itemID, focusID,
		{ FilePond } = window, // import FilePond
		widgetType = 'media_image',
		mediaWidgets = document.querySelectorAll( '.media-widget-control' ),
		queryParams = new URLSearchParams( window.location.search ),
		uploader = document.querySelector( '.uploader-inline' ),
		inputElement = document.getElementById( 'filepond' ),
		ajaxurl	= document.getElementById( 'ajax-url' ).value,		
		body = document.body,
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
	
	/* Re-arrange fields to media widgets on page load */
	mediaWidgets.forEach( function( mediaWidget ) {
		var widget = mediaWidget.closest( '.widget' );
		widget.querySelector( '.widget-content' ).before( widget.querySelector( '.media-widget-control' ) );
	} );

	/* Re-arrange fields to each media widget when first created */
	document.addEventListener( 'widget-added', function( event ) {
		var control = event.detail.widget.querySelector( '.media-widget-control' );
		if ( control != null ) {
			event.detail.widget.querySelector( '.widget-content' ).before( control );
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
	document.querySelectorAll( '.widgets-sortables .select-media' ).forEach( function( addMedia ) {
		addMedia.addEventListener( 'click', function( e ) {
			focusID = e.target.closest( 'li' ).id;
			widgetType = e.target.parentNode.parentNode.className.replace( 'media-widget-preview ', '' );
			updateGrid();
			dialog.showModal();
		} );
	} );

	// Set functions for Escape and Enter keys
	document.addEventListener( 'keyup', function( e ) {
		if ( e.key === 'Escape' ) {
			document.getElementById( focusID ).querySelector( 'details' ).open = true;
			document.getElementById( focusID ).querySelector( '.select-media' ).focus();
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
		document.querySelectorAll( '.media-item.selected' ).forEach( function( selectedItem ) {
			var widgetItem;

			if ( widgetType === 'media_audio' ) {
				widgetItem = '';
			} else if ( widgetType === 'media_video' ) {
				widgetItem = '';
			} else {
				widgetItem = selectedItem.querySelector( 'img' );
				widgetItem.className = 'attachment-thumb';
			}

			if ( document.getElementById( focusID ).querySelector( '.attachment-media-view' ) != null ) {
				document.getElementById( focusID ).querySelector( '.attachment-media-view' ).remove();
			}

			document.getElementById( focusID ).querySelector( '.media-widget-preview' ).classList.add( widgetType );
			document.getElementById( focusID ).querySelector( '.media-widget-preview' ).classList.add( 'populated' );
			document.getElementById( focusID ).querySelector( '.media-widget-preview' ).append( widgetItem );
			document.getElementById( focusID ).querySelector( '.media-widget-buttons' ).style.display = '';
			document.getElementById( focusID ).dispatchEvent( new Event( 'change' ) );
		} );
		closeButton.click();
	} );

	/* Close modal by clicking button */
	closeButton.addEventListener( 'click', function() {
		dialog.classList.remove( 'modal-loading' );
		dialog.close();
		if ( focusID != null ) { // set focus correctly
			document.getElementById( focusID ).querySelector( '.select-media' ).focus();
			focusID = null; // reset focusID
		}
		removeImageEditWrap();
	} );



/*
			var div = document.createElement( 'div' ),
				index = widget.id;

			div.className = 'widget-content';

			div.innerHTML = '<input type="hidden" data-property="size" class="media-widget-instance-property" name="widget-media_image[7][size]" id="widget-media_image-7-size" value="medium">' +
			'<input type="hidden" data-property="width" class="media-widget-instance-property" name="widget-media_image[7][width]" id="widget-media_image-7-width" value="0">' +
			'<input type="hidden" data-property="height" class="media-widget-instance-property" name="widget-media_image[7][height]" id="widget-media_image-7-height" value="0">' +
			'<input type="hidden" data-property="caption" class="media-widget-instance-property" name="widget-media_image[7][caption]" id="widget-media_image-7-caption" value="">' +
			'<input type="hidden" data-property="alt" class="media-widget-instance-property" name="widget-media_image[7][alt]" id="widget-media_image-7-alt" value="">' +
			'<input type="hidden" data-property="link_type" class="media-widget-instance-property" name="widget-media_image[7][link_type]" id="widget-media_image-7-link_type" value="custom">' +
			'<input type="hidden" data-property="link_url" class="media-widget-instance-property" name="widget-media_image[7][link_url]" id="widget-media_image-7-link_url" value="">' +
			'<input type="hidden" data-property="image_classes" class="media-widget-instance-property" name="widget-media_image[7][image_classes]" id="widget-media_image-7-image_classes" value="">' +
			'<input type="hidden" data-property="link_classes" class="media-widget-instance-property" name="widget-media_image[7][link_classes]" id="widget-media_image-7-link_classes" value="">' +
			'<input type="hidden" data-property="link_rel" class="media-widget-instance-property" name="widget-media_image[7][link_rel]" id="widget-media_image-7-link_rel" value="">' +
			'<input type="hidden" data-property="link_target_blank" class="media-widget-instance-property" name="widget-media_image[7][link_target_blank]" id="widget-media_image-7-link_target_blank" value="">' +
			'<input type="hidden" data-property="image_title" class="media-widget-instance-property" name="widget-media_image[7][image_title]" id="widget-media_image-7-image_title" value="">' +
			'<input type="hidden" data-property="attachment_id" class="media-widget-instance-property" name="widget-media_image[7][attachment_id]" id="widget-media_image-7-attachment_id" value="0">' +
			'<input type="hidden" data-property="url" class="media-widget-instance-property" name="widget-media_image[7][url]" id="widget-media_image-7-url" value="">' +
			'<input type="hidden" data-property="title" class="media-widget-instance-property" name="widget-media_image[7][title]" id="widget-media_image-7-title" value="">';
		}
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
		allowMultiple: true,
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

						// Open modal to show details about file, or select file for deletion
						gridItem.addEventListener( 'click', function() {
							selectItemToAdd( gridItem );
						} );
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
		acceptedFileTypes: document.querySelector( '.uploader-inline' ).dataset.allowedMimes.split( ',' ),
		labelFileTypeNotAllowed: _wpMediaGridSettings.invalid_type,
		fileValidateTypeLabelExpectedTypes: _wpMediaGridSettings.check_types,
	} );

} );
