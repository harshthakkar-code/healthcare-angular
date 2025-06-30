import { Component, OnInit } from '@angular/core';
import { Lightbox } from 'ngx-lightbox';
import lgZoom from 'lightgallery/plugins/zoom';
import { BeforeSlideDetail } from 'lightgallery/lg-events';

import { routes } from 'src/app/shared/routes/routes';

interface data {
  value: string;
}

@Component({
    selector: 'app-map-list',
    templateUrl: './map-list.component.html',
    styleUrls: ['./map-list.component.scss'],
    standalone: false
})
export class MapListComponent implements OnInit {
  settings = {
    counter: false,
    plugins: [lgZoom],
  };
  onBeforeSlide = (detail: BeforeSlideDetail): void => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { index, prevIndex } = detail;
  };
  public routes = routes;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public albumsOne: any = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slider: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private infowindow!: google.maps.InfoWindow;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc_name: any;
  private bounds = new google.maps.LatLngBounds();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any;
  current = 0;
  content: '' | undefined;
  public selectedValue1 = '';
  selectedList1: data[] = [{ value: 'Relevance' }, { value: 'Price' }];
  locations = [
    {
      id: 1,
      doc_name: 'Dr. Ruby Perrin',
      speciality: 'Psychologist',
      address: 'Florida, USA',
      nextavailable: 'Available on Fri, 22 Mar',
      amount: '$300 - $1000',
      lat: 53.470692,
      lng: -2.220328,
      icons: 'default',
      profile_link: 'profile.html',
      total_review: '17',
      image: 'assets/img/doctors/doctor-01.jpg',
    },
    {
      id: 2,
      doc_name: 'Dr. Darren Elder',
      speciality: 'Psychologist',
      address: 'Newyork, USA',
      nextavailable: 'Available on Fri, 23 Mar',
      amount: '$50 - $300',
      lat: 53.469189,
      lng: -2.199262,
      icons: 'default',
      profile_link: 'profile.html',
      total_review: '35',
      image: 'assets/img/doctors/doctor-02.jpg',
    },
    {
      id: 3,
      doc_name: 'Dr. Deborah Angel',
      speciality: 'Psychologist',
      address: 'Georgia, USA',
      nextavailable: 'Available on Fri, 23 Mar',
      amount: '"$100 - $400',
      lat: 53.468665,
      lng: -2.189269,
      icons: 'default',
      profile_link: 'profile.html',
      total_review: '27',
      image: 'assets/img/doctors/doctor-03.jpg',
    },
    {
      id: 4,
      doc_name: 'Dr. Sofia Brient',
      speciality: 'Psychologist',
      address: 'Louisiana, USA',
      nextavailable: 'Available on Fri, 25 Mar',
      amount: '$150 - $250',
      lat: 53.463894,
      lng: -2.17788,
      icons: 'default',
      profile_link: 'profile.html',
      total_review: '4',
      image: 'assets/img/doctors/doctor-04.jpg',
    },
    {
      id: 5,
      doc_name: 'Dr. Marvin Campbell',
      speciality: 'Psychologist',
      address: 'Michigan, USA',
      nextavailable: 'Available on Fri, 25 Mar',
      amount: '$50 - $700',
      lat: 53.466359,
      lng: -2.213314,
      icons: 'default',
      profile_link: 'profile.html',
      total_review: '66',
      image: 'assets/img/doctors/doctor-05.jpg',
    },
    {
      id: 6,
      doc_name: 'Dr. Katharine Berthold',
      speciality: 'Psychologist',
      address: 'Texas, USA',
      nextavailable: 'Available on Fri, 25 Mar',
      amount: '$100 - $500',
      lat: 53.463906,
      lng: -2.213271,
      icons: 'default',
      profile_link: 'profile.html',
      total_review: '52',
      image: 'assets/img/doctors/doctor-06.jpg',
    },
    {
      id: 7,
      doc_name: 'Dr. Linda Tobin',
      speciality: 'Psychologist',
      address: 'Kansas, USA',
      nextavailable: 'Available on Fri, 25 Mar',
      amount: '$100 - $1000',
      lat: 53.461974,
      lng: -2.210661,
      icons: 'default',
      profile_link: 'profile.html',
      total_review: '43',
      image: 'assets/img/doctors/doctor-07.jpg',
    },
    {
      id: 8,
      doc_name: 'Dr. Paul Richard',
      speciality: 'Psychologist',
      address: 'California, USA',
      nextavailable: 'Available on Fri, 25 Mar',
      amount: '$100 - $1000',
      lat: 53.458785,
      lng: -2.188532,
      icons: 'default',
      profile_link: 'profile.html',
      total_review: '49',
      image: 'assets/img/doctors/doctor-08.jpg',
    },
    {
      id: 9,
      doc_name: ' Dr. John Gibbs',
      speciality: 'Psychologist',
      address: 'Oklahoma, USA',
      nextavailable: 'Available on Fri, 25 Mar',
      amount: '"$500 - $2500',
      lat: 53.4558571,
      lng: -2.1950372,
      icons: 'default',
      profile_link: 'profile.html',
      total_review: '112',
      image: 'assets/img/doctors/doctor-09.jpg',
    },
    {
      id: 10,
      doc_name: 'Dr. Olga Barlow',
      speciality: 'Psychologist',
      address: 'Montana, USA',
      nextavailable: 'Available on Fri, 25 Mar',
      amount: '$75 - $250',
      lat: 53.45885,
      lng: -2.194549,
      icons: 'default',
      profile_link: 'profile.html',
      total_review: '65',
      image: 'assets/img/doctors/doctor-10.jpg',
    },
    {
      id: 11,
      doc_name: ' Dr. Julia Washington',
      speciality: 'Psychologist',
      address: 'Oklahoma, USA',
      nextavailable: 'Available on Fri, 25 Mar',
      amount: '$275 - $450',
      lat: 53.461733,
      lng: -2.194502,
      icons: 'default',
      profile_link: 'profile.html',
      total_review: '5',
      image: 'assets/img/doctors/doctor-11.jpg',
    },
    {
      id: 12,
      doc_name: ' Dr. Shaun Aponte',
      speciality: 'Psychologist',
      nextavailable: 'Available on Fri, 25 Mar',
      amount: '$275 - $450',
      address: 'Indiana, USA',
      lat: 53.460548,
      lng: -2.190956,
      icons: 'default',
      profile_link: 'profile.html',
      total_review: '5',
      image: 'assets/img/doctors/doctor-12.jpg',
    },
  ];
  images = [
    {
      path: 'assets/img/features/feature-01.jpg',
    },
    {
      path: 'assets/img/features/feature-02.jpg',
    },
    {
      path: 'assets/img/features/feature-03.jpg',
    },
    {
      path: 'assets/img/features/feature-04.jpg',
    },
  ];
  ngOnInit(): void {
    this.initilize();
    if (!sessionStorage.getItem('pageReloaded')) {
      sessionStorage.setItem('pageReloaded', 'true');
      window.location.reload();
    } else {
      sessionStorage.removeItem('pageReloaded'); // Reset for future reloads
      this.initilize();
    }
  }
  show() {
    this.infowindow.close();
    if (!this.map.slide) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let next: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let marker: any;
    if (this.locations.length == 0) {
      return;
    } else if (this.locations.length == 1) {
      next = 0;
    }
    if (this.locations.length > 1) {
      do {
        next = Math.floor(Math.random() * this.locations.length);
      } while (next == this.current);
    }
    this.current = next;
    
    // eslint-disable-next-line prefer-const
    marker = this.locations[next];
    this.setInfo(marker);
    this.infowindow.open(this.map, marker);
  }
  initilize() {
    const mapOptions: google.maps.MapOptions = {
      zoom: 14,
      center: new google.maps.LatLng(53.470692, -2.220328),
      scrollwheel: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);
    this.map['slide'] = true;
    this.infowindow = new google.maps.InfoWindow({ content: 'loading...' });
    google.maps.event.addListener(this.infowindow, 'closeclick', () => {
      this.infowindow.close();
    });
    this.map.slide = true;

    this.setMarkers(this.map, this.locations);
    this.infowindow = new google.maps.InfoWindow({
      content: 'loading...',
    });
    // google.maps.event.addListener(this.infowindow, 'closeclick', function () {
    //   this.infowindow.close();
    // });
    // this.slider = window.setTimeout(this.show, 3000);
  }
  setInfo(marker: {
    profile_link: string;
    next_available: string;
    doc_name: string;
    total_review: string;
    speciality: string;
    image: string;
    amount: string;
    address: string;
  }) {
    const content =
      '<div class="card border-0" style="width: 100%; display: inline-block;">'+
	'<div class="card-body">'+
		'<div class="doc-img d-flex align-items-center">'+
			'<a href="' + marker.profile_link + '" class="avatar flex-shrink-0 me-2 avatar-xl avatar-rounded" tabindex="0" target="_blank">'+
				'<img class="img-fluid" alt="' + marker.doc_name + '" src="' + marker.image + '">'+
			'</a>'+
			'<div>'+
				'<h6 class="title fs-16 mb-1">'+
					'<a href="' + marker.profile_link + '" tabindex="0">' + marker.doc_name + '</a>'+
					'<span class="badge bg-orange mt-1"><i class="fa-solid fa-star me-1"></i>5.0</span>'+
				'</h6>'+
				'<p class="speciality text-indigo">' + marker.speciality + '</p>'+
			'</div>'+
		'</div>'+
		'<div class="pro-content">'+
			'<ul class="available-info">'+
				'<li><i class="fas fa-map-marker-alt"></i> ' + marker.address + ' </li>'+
			'</ul>'+
		'</div>'+
	'</div>'+
'</div>';
    this.infowindow.setContent(content);
  }
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setMarkers(map: any, locations: any) {
    for (let i = 0; i < locations.length; i++) {
      const item = locations[i];
      const latlng = new google.maps.LatLng(item.lat, item.lng);
      const marker = new google.maps.Marker({
        position: latlng,
        map: map,

        icon: 'assets/img/marker.png',
      });
      this.bounds.extend(latlng);

      google.maps.event.addListener(marker, 'click', () => {
        this.setInfo(item);
        this.infowindow.open(map, marker);
      });
    }
    map.fitBounds(this.bounds);
    google.maps.event.addListener(map, 'zoom_changed', function () {
      if (map.zoom > 16) map.slide = false;
    });
  }
  constructor(private _lightbox: Lightbox) {

    for (let i = 1; i <= 4; i++) {
      const src = 'assets/img/features/feature-' + i + '.jpg';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      const caption = 'Image ' + i + ' caption here';
      
      this.albumsOne.push({ src: src });
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  open(index: number, albumArray: Array<any>): void {
    this._lightbox.open(albumArray, index);
  }
  close(): void {
    this._lightbox.close();
  }
  ngOnDestroy():void{
    this.initilize();
  }
}
