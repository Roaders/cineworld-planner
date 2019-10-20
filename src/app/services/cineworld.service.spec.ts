
import { HttpClient } from '@angular/common/http';
import { CineworldService } from './cineworld.service';
import { Subject } from 'rxjs';
import { ICinema } from '../../contracts/contracts';

// tslint:disable: max-line-length
describe('cineworld.service', () => {

    let cinemaListSubject: Subject<string>;

    beforeEach(() => {
        cinemaListSubject = new Subject<string>();
    });

    function getInstance() {
        const mockHTTP = {
            get: () => cinemaListSubject,
        } as unknown as HttpClient;

        return new CineworldService(mockHTTP);
    }

    it('should create', () => {
        expect(getInstance()).toBeDefined();
    });

    describe('getCinemaListAsync', () => {

        it('should return a formatted cinema list', () => {
            const instance = getInstance();

            let result: ICinema[] | undefined;

            instance.getCinemaListAsync().subscribe(value => result = value);

            cinemaListSubject.next(cinemaListParitalHtml);
            cinemaListSubject.complete();

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBeTruthy();
            // tslint:disable-next-line: no-non-null-assertion
            expect(result!.length).toBeGreaterThan(10);
        });

    });

});

const cinemaListParitalHtml = `{
    facebookAppId: "1008077322554983"
  },
  appVersion = "ver-2.5.46",
  isRtl = false,
  resourceFolder = '/xmedia/img/10108',
  tenantId = '10108',
  apiSitesList = [{"externalCode":"8014","uri":"\/cinemas\/aberdeen-queens-links","name":"Aberdeen - Queens Links","filename":"\/static\/dam\/jcr:ac2e337f-ff5e-497f-8f36-56f92a216ffc","latitude":57.15026,"longitude":-2.077969,"address":{"address1":"Queens Links Leisure Park","address2":"Links Road","address3":null,"address4":null,"city":"Aberdeen","state":null,"postalCode":"AB24 5EN"}},{"externalCode":"8018","uri":"\/cinemas\/aberdeen-union-square","name":"Aberdeen - Union Square","filename":"\/static\/dam\/jcr:89bf328d-73d0-4539-9787-e2d64ea29188","latitude":57.14292,"longitude":-2.09637,"address":{"address1":"Union Square","address2":"Guild Square","address3":null,"address4":null,"city":"Aberdeen","state":null,"postalCode":"AB11 5RG"}},{"externalCode":"8015","uri":"\/cinemas\/aldershot","name":"Aldershot","filename":"\/static\/dam\/jcr:81c81649-29b2-4c7c-8a18-6b18cb7f7934","latitude":51.25068,"longitude":-0.768437,"address":{"address1":"Westgate","address2":null,"address3":null,"address4":null,"city":"Aldershot","state":null,"postalCode":"GU11 1WG"}},{"externalCode":"8016","uri":"\/cinemas\/ashford","name":"Ashford","filename":"\/static\/dam\/jcr:05ab9599-42d6-41e1-b081-fddca5fe7229","latitude":51.160915,"longitude":0.872751,"address":{"address1":"Eureka Entertainment Centre\u00A0","address2":"Rutherford Road","address3":null,"address4":null,"city":"Ashford","state":null,"postalCode":"TN25 4BN"}},{"externalCode":"8017","uri":"\/cinemas\/ashton-under-lyne","name":"Ashton-under-Lyne","filename":"\/static\/dam\/jcr:489febb6-297d-47e1-bfe5-614b79b6ac89","latitude":53.48905,"longitude":-2.111577,"address":{"address1":"Ashton Leisure Park\u00A0","address2":"Fold Way","address3":null,"address4":null,"city":"Ashton-under-Lyne","state":null,"postalCode":"OL7 0PG"}},{"externalCode":"8113","uri":"\/cinemas\/basildon","name":"Basildon","filename":"\/static\/dam\/jcr:2b130bda-6a79-4332-8974-79a207174be5","latitude":51.585,"longitude":0.462503,"address":{"address1":"Festival Leisure Park","address2":null,"address3":null,"address4":null,"city":"Basildon","state":null,"postalCode":"SS14 3WB"}},{"externalCode":"8019","uri":"\/cinemas\/bedford","name":"Bedford","filename":"\/static\/dam\/jcr:98f82ff3-2a4a-4059-9a31-198b9b26fd06","latitude":52.133324,"longitude":-0.445841,"address":{"address1":"Aspects Leisure Park","address2":"Newnham Avenue","address3":null,"address4":null,"city":"Bedford","state":null,"postalCode":"MK41 9LW"}},{"externalCode":"8022","uri":"\/cinemas\/birmingham-broad-street","name":"Birmingham - Broad Street","filename":"\/static\/dam\/jcr:f1cfd921-01b2-4c1d-9aa9-645355d6ff12","latitude":52.473816,"longitude":-1.915563,"address":{"address1":"181 Broad Street","address2":null,"address3":null,"address4":null,"city":"Birmingham","state":null,"postalCode":"B15 1DA"}},{"externalCode":"8102","uri":"\/cinemas\/birmingham-nec","name":"Birmingham - NEC","filename":"\/static\/dam\/jcr:40dad242-2d6a-4b80-8083-5fa5d03954fd","latitude":52.4481,"longitude":-1.71768,"address":{"address1":"Resorts World","address2":"Pendigo Way","address3":null,"address4":null,"city":"Birmingham","state":null,"postalCode":"B40 1PU"}},{"externalCode":"8029","uri":"\/cinemas\/boldon-tyne-and-wear","name":"Boldon Tyne and Wear","filename":"\/static\/dam\/jcr:41bd2cf5-8b46-4a9b-9109-016583b6c60e","latitude":54.946793,"longitude":-1.46633,"address":{"address1":"Boldon Leisure Park","address2":"Bolden Colliery","address3":null,"address4":null,"city":"Tyne and Wear","state":null,"postalCode":"NE35 9PB"}},{"externalCode":"8023","uri":"\/cinemas\/bolton","name":"Bolton","filename":"\/static\/dam\/jcr:0b9a43fa-efb8-41cb-b2e8-85d933c1e585","latitude":53.5972,"longitude":-2.423955,"address":{"address1":"The Valley","address2":"15 Eagley Brook Way","address3":null,"address4":null,"city":"Bolton","state":null,"postalCode":"BL1 8TS"}},{"externalCode":"8119","uri":"\/cinemas\/bracknell","name":"Bracknell","filename":"\/static\/dam\/jcr:3ed05c1b-034f-4d3e-b3bf-c2f6542932c7","latitude":51.41745,"longitude":-0.750222,"address":{"address1":"2 Eagle Lane","address2":null,"address3":null,"address4":null,"city":"Bracknell","state":null,"postalCode":"RG12 1BG"}},{"externalCode":"8021","uri":"\/cinemas\/bradford","name":"Bradford","filename":"\/static\/dam\/jcr:d7a08844-e707-48f1-933a-f63fda10a1b4","latitude":53.791622,"longitude":-1.747758,"address":{"address1":"Bradford Leisure Exchange","address2":"Vicar Lane","address3":null,"address4":null,"city":"Bradford","state":null,"postalCode":"BD1 5LD"}},{"externalCode":"8025","uri":"\/cinemas\/braintree","name":"Braintree","filename":"\/static\/dam\/jcr:8b736c26-37ff-4645-b211-cb302fb33ac1","latitude":51.869987,"longitude":0.570995,"address":{"address1":"Freeport Leisure","address2":"Charter Way","address3":null,"address4":null,"city":"Braintree","state":null,"postalCode":"CM77 8YH"}},{"externalCode":"8026","uri":"\/cinemas\/brighton","name":"Brighton","filename":"\/static\/dam\/jcr:5e918eb1-4f81-47ff-a360-374fb90e316c","latitude":50.81263,"longitude":-0.100665,"address":{"address1":"Brighton Marina Village","address2":null,"address3":null,"address4":null,"city":"Brighton","state":null,"postalCode":"BN2 5UF"}},{"externalCode":"8028","uri":"\/cinemas\/bristol","name":"Bristol","filename":"\/static\/dam\/jcr:8843b8a5-978f-447e-8a9e-1190603e7e87","latitude":51.416344,"longitude":-2.587141,"address":{"address1":"Hengrove Leisure Park","address2":"Hengrove Way","address3":null,"address4":null,"city":"Bristol","state":null,"postalCode":"BS14 0HR"}},{"externalCode":"8100","uri":"\/cinemas\/broughton","name":"Broughton","filename":"\/static\/dam\/jcr:70bf12a4-5526-4cc6-93f8-e5734c91fdcc","latitude":53.16858,"longitude":-2.9736962,"address":{"address1":"Broughton Shopping Park","address2":"Chester Road","address3":"Flintshire","address4":null,"city":"Broughton","state":null,"postalCode":"CH4 0DE"}},{"externalCode":"8024","uri":"\/cinemas\/burton-upon-trent","name":"Burton upon Trent","filename":"\/static\/dam\/jcr:8c841f1b-9734-4ac6-8af0-548951a11daa","latitude":52.80561,"longitude":-1.632458,"address":{"address1":"Middle Way Park","address2":"Guild Street","address3":null,"address4":null,"city":"Burton upon Trent","state":null,"postalCode":"DE14 1NQ"}},{"externalCode":"8027","uri":"\/cinemas\/bury-st-edmunds","name":"Bury St Edmunds","filename":"\/static\/dam\/jcr:98f82ff3-2a4a-4059-9a31-198b9b26fd06","latitude":52.246216,"longitude":0.706635,"address":{"address1":"Park Way","address2":null,"address3":null,"address4":null,"city":"Bury St Edmunds","state":null,"postalCode":"IP33 3BA"}},{"externalCode":"8031","uri":"\/cinemas\/cardiff","name":"Cardiff","filename":"\/static\/dam\/jcr:6e2d4eeb-8932-4da1-bf39-e34cd9652ac4","latitude":51.478737,"longitude":-3.173405,"address":{"address1":"Mary Ann Street","address2":null,"address3":null,"address4":null,"city":"Cardiff","state":null,"postalCode":"CF10 2EN"}},{"externalCode":"8032","uri":"\/cinemas\/castleford","name":"Castleford","filename":"\/static\/dam\/jcr:14a247c4-3db0-47d2-86ef-c5a9c6240e42","latitude":53.71019,"longitude":-1.3419,"address":{"address1":"Xscape","address2":"Colorado Way","address3":null,"address4":null,"city":"Castleford","state":null,"postalCode":"WF10 4TA"}},{"externalCode":"8034","uri":"\/cinemas\/cheltenham","name":"Cheltenham","filename":"\/static\/dam\/jcr:9ad29240-0e50-40c7-82a9-dd4a3978ab42","latitude":51.90293,"longitude":-2.075018,"address":{"address1":"The Brewery Quarter","address2":"Henrietta Street","address3":null,"address4":null,"city":"Cheltenham","state":null,"postalCode":"GL50 4FA"}},{"externalCode":"8039","uri":"\/cinemas\/chesterfield","name":"Chesterfield","filename":"\/static\/dam\/jcr:588a5dce-b10c-4417-bf54-8cf570963c79","latitude":53.22716,"longitude":-1.424189,"address":{"address1":"Alma Leisure Park","address2":"Derby Road","address3":null,"address4":null,"city":"Chesterfield","state":null,"postalCode":"S40 2ED"}},{"externalCode":"8033","uri":"\/cinemas\/chichester","name":"Chichester","filename":"\/static\/dam\/jcr:7e8b3341-592e-48da-aacd-65c565dee41d","latitude":50.830006,"longitude":-0.785063,"address":{"address1":"Chichester Gate","address2":null,"address3":null,"address4":null,"city":"Chichester","state":null,"postalCode":"PO19 8EL"}},{"externalCode":"8037","uri":"\/cinemas\/crawley","name":"Crawley","filename":"\/static\/dam\/jcr:7943998f-210f-438e-9231-ce015b2a7c81","latitude":51.120823,"longitude":-0.189681,"address":{"address1":"Crawley Leisure Park","address2":"London Road","address3":null,"address4":null,"city":"Crawley","state":null,"postalCode":"RH10 8LR"}},{"externalCode":"8114","uri":"\/cinemas\/dalton-park","name":"Dalton Park","filename":"\/static\/dam\/jcr:6e53c892-8ac9-4c9b-b8f6-acebdf5dd9e4","latitude":54.815483,"longitude":-1.376749,"address":{"address1":"Dalton Park","address2":"County Durham","address3":null,"address4":null,"city":"Murton","state":null,"postalCode":"SR7 9HU"}},{"externalCode":"8040","uri":"\/cinemas\/didcot","name":"Didcot","filename":"\/static\/dam\/jcr:b927ca0d-f79c-46ea-b882-5892517ac05b","latitude":51.608234,"longitude":-1.239831,"address":{"address1":"27 Station Road","address2":null,"address3":null,"address4":null,"city":"Didcot","state":null,"postalCode":"OX11 7NE"}},{"externalCode":"8041","uri":"\/cinemas\/didsbury","name":"Didsbury","filename":"\/static\/dam\/jcr:b0ffe169-013a-4dd3-9463-9165fc6fbde6","latitude":53.407806,"longitude":-2.220271,"address":{"address1":"Parrs Wood Entertainment Centre","address2":"Wilmslow Road","address3":null,"address4":null,"city":"Manchester","state":null,"postalCode":"M20 5PG"}},{"externalCode":"8122","uri":"\/cinemas\/dover","name":"Dover","filename":"\/static\/dam\/jcr:0febedfa-2a2f-401d-b2a4-336bb04c411a","latitude":51.12565,"longitude":1.317104,"address":{"address1":"Unit 1, Dover St James","address2":"St James Street","address3":null,"address4":null,"city":"Dover","state":null,"postalCode":"CT16 1QD"}},{"externalCode":"8042","uri":"\/cinemas\/dundee","name":"Dundee","filename":"\/static\/dam\/jcr:235ca9fa-fed1-4045-aaa7-e43816f5ed0d","latitude":56.484383,"longitude":-3.046191,"address":{"address1":"Camperdown Leisure Park","address2":"Kingsway West","address3":null,"address4":null,"city":"Dundee","state":null,"postalCode":"DD2 4TF"}},{"externalCode":"8126","uri":"\/cinemas\/eastbourne-at-the-beacon","name":"Eastbourne at The Beacon","filename":"\/static\/dam\/jcr:0febedfa-2a2f-401d-b2a4-336bb04c411a","latitude":50.769264,"longitude":0.282836,"address":{"address1":"The Beacon","address2":"Terminus Road","address3":null,"address4":null,"city":"Eastbourne","state":null,"postalCode":"BN21 3NW"}},{"externalCode":"8044","uri":"\/cinemas\/edinburgh","name":"Edinburgh","filename":"\/static\/dam\/jcr:be630279-5e67-4bbb-aa3c-e671a4074bf5","latitude":55.941936,"longitude":-3.216934,"address":{"address1":"Fountain Park","address2":"130\/3 Dundee Street","address3":null,"address4":null,"city":"Edinburgh","state":null,"postalCode":"EH11 1AF"}},{"externalCode":"8116","uri":"\/cinemas\/ely","name":"Ely","filename":"\/static\/dam\/jcr:b6eac5fa-8620-4b53-b5c4-38f13f1ccc8f","latitude":52.40956,"longitude":0.250741,"address":{"address1":"Ely Leisure Village","address2":"Downham Road","address3":null,"address4":null,"city":"Ely","state":null,"postalCode":"CB6 2WH"}},{"externalCode":"8046","uri":"\/cinemas\/falkirk","name":"Falkirk","filename":"\/static\/dam\/jcr:8843b8a5-978f-447e-8a9e-1190603e7e87","latitude":56.00377,"longitude":-3.779896,"address":{"address1":"Central Retail Park","address2":"Old Bison Works","address3":null,"address4":null,"city":"Falkirk","state":null,"postalCode":"FK1 1LW"}},{"externalCode":"8054","uri":"\/cinemas\/glasgow-imax-at-gsc","name":"Glasgow - IMAX at GSC","filename":"\/static\/dam\/jcr:ca9aec16-0cc6-4757-9aac-78afde39e4c0","latitude":55.860203,"longitude":-4.293809,"address":{"address1":"50 Pacific Quay","address2":null,"address3":null,"address4":null,"city":"Glasgow","state":null,"postalCode":"G51 1EA"}},{"externalCode":"8049","uri":"\/cinemas\/glasgow-parkhead","name":"Glasgow - Parkhead","filename":"\/static\/dam\/jcr:58bf0b3f-66cd-462b-85a4-13f3a64bda48","latitude":55.853436,"longitude":-4.199809,"address":{"address1":"Forge Shopping Centre","address2":"1221 Gallowgate","address3":null,"address4":null,"city":"Glasgow","state":null,"postalCode":"G31 4EB"}},{"externalCode":"8053","uri":"\/cinemas\/glasgow-renfrew-street","name":"Glasgow - Renfrew Street","filename":"\/static\/dam\/jcr:b3a892b2-a7db-4f42-b825-f4cac484cf63","latitude":55.8649,"longitude":-4.255164,"address":{"address1":"7 Renfrew Street","address2":null,"address3":null,"address4":null,"city":"Glasgow","state":null,"postalCode":"G2 3AB"}},{"externalCode":"8101","uri":"\/cinemas\/glasgow-silverburn","name":"Glasgow - Silverburn","filename":"\/static\/dam\/jcr:e14d3042-8dae-4f34-a19a-7d0dd4e940d3","latitude":55.821617,"longitude":-4.34184,"address":{"address1":"Silverburn Shopping Centre","address2":"763 Barrhead Road","address3":null,"address4":null,"city":"Glasgow","state":null,"postalCode":"G53 6AG"}},{"externalCode":"8051","uri":"\/cinemas\/gloucester-quays","name":"Gloucester Quays","filename":"\/static\/dam\/jcr:7b4f20c4-7754-40d9-8f5c-58de1bfbed79","latitude":51.86083,"longitude":-2.25256,"address":{"address1":"Gloucester Quays Outlet Centre","address2":"Merchants Road","address3":null,"address4":null,"city":"Gloucester","state":null,"postalCode":"GL1 5SH"}},{"externalCode":"8115","uri":"\/cinemas\/harlow-harvey-centre","name":"Harlow - Harvey Centre","filename":"\/static\/dam\/jcr:cbba329f-da98-4824-b679-84df78aa9f4b","latitude":51.76909,"longitude":0.0899925,"address":{"address1":"Harvey Shopping Centre","address2":null,"address3":null,"address4":null,"city":"Harlow","state":null,"postalCode":"CM20 1XR"}},{"externalCode":"8056","uri":"\/cinemas\/harlow-queensgate","name":"Harlow - Queensgate","filename":"\/static\/dam\/jcr:29f84fcd-391c-4530-be04-8a0f662e3df5","latitude":51.783882,"longitude":0.108092,"address":{"address1":"Edinburgh Way","address2":null,"address3":null,"address4":null,"city":"Harlow","state":null,"postalCode":"CM20 2DA"}},{"externalCode":"8057","uri":"\/cinemas\/haverhill","name":"Haverhill","filename":"\/static\/dam\/jcr:598d7452-4fe8-471d-a05b-3e7ab1ee2e28","latitude":52.08379,"longitude":0.43978,"address":{"address1":"Ehringshausen Way","address2":null,"address3":null,"address4":null,"city":"Haverhill","state":null,"postalCode":"CB9 0ER"}},{"externalCode":"8111","uri":"\/cinemas\/hemel-hempstead","name":"Hemel Hempstead","filename":"\/static\/dam\/jcr:0febedfa-2a2f-401d-b2a4-336bb04c411a","latitude":51.7481,"longitude":-0.454941,"address":{"address1":"Jarman Square","address2":"Formerly Leisure World, Jarman Park","address3":null,"address4":null,"city":"Hemel Hempstead","state":null,"postalCode":"HP2 4JW"}},{"externalCode":"8061","uri":"\/cinemas\/high-wycombe","name":"High Wycombe","filename":"\/static\/dam\/jcr:1f054d1a-a2dd-4e3a-99f4-63b84a6b3bfb","latitude":51.629055,"longitude":-0.753768,"address":{"address1":"Denmark Street","address2":"Eden","address3":null,"address4":null,"city":"High Wycombe","state":null,"postalCode":"HP11 2DB"}},{"externalCode":"8105","uri":"\/cinemas\/hinckley","name":"Hinckley","filename":"\/static\/dam\/jcr:0febedfa-2a2f-401d-b2a4-336bb04c411a","latitude":52.539345,"longitude":-1.372837,"address":{"address1":"The Crescent","address2":"Station Road","address3":null,"address4":null,"city":"Hinckley","state":null,"postalCode":"LE10 1AW"}},{"externalCode":"8059","uri":"\/cinemas\/hull","name":"Hull","filename":"\/static\/dam\/jcr:6686a7a7-d381-4113-9114-2f8d2fbd489b","latitude":53.79138,"longitude":-0.353455,"address":{"address1":"Kingswood Retail Park","address2":"Gibraltar Road","address3":null,"address4":null,"city":"Hull","state":null,"postalCode":"HU7 3DB"}},{"externalCode":"8060","uri":"\/cinemas\/huntingdon","name":"Huntingdon","filename":"\/static\/dam\/jcr:98f82ff3-2a4a-4059-9a31-198b9b26fd06","latitude":52.351425,"longitude":-0.18068,"address":{"address1":"Tower Field Park","address2":"Abbots Ripton Road","address3":null,"address4":null,"city":"Huntingdon","state":null,"postalCode":"PE29 7EG"}},{"externalCode":"8064","uri":"\/cinemas\/ipswich","name":"Ipswich","filename":"\/static\/dam\/jcr:ddecac6b-0425-4e81-a4da-d291a1a2c373","latitude":52.053234,"longitude":1.151031,"address":{"address1":"Cardinal Park","address2":"11 Grafton Way","address3":null,"address4":null,"city":"Ipswich","state":null,"postalCode":"IP1 1AX"}},{"externalCode":"8065","uri":"\/cinemas\/jersey","name":"Jersey","filename":"\/static\/dam\/jcr:e5ab4653-ef05-4315-a5cb-68f52c41ac78","latitude":49.18315,"longitude":-2.11444,"address":{"address1":"Waterfront Centre","address2":"La Rue de L'Etau\u00A0","address3":null,"address4":null,"city":"St Helier","state":null,"postalCode":"JE2 4HE"}},{"externalCode":"8120","uri":"\/cinemas\/leeds-white-rose","name":"Leeds - White Rose","filename":"\/static\/dam\/jcr:33dd12bb-0f75-4c1d-809b-de96faa964fe","latitude":53.758377,"longitude":-1.5777655,"address":{"address1":"White Rose Shopping Centre","address2":"Dewsbury Road","address3":null,"address4":null,"city":"Leeds","state":null,"postalCode":"LS11 8LU"}},{"externalCode":"8066","uri":"\/cinemas\/leigh","name":"Leigh","filename":"\/static\/dam\/jcr:ab324341-2676-4717-b678-6e1e3aa9c3d6","latitude":53.494057,"longitude":-2.515247,"address":{"address1":"The Loom","address2":"Spinning Jenny Way","address3":null,"address4":null,"city":"Leigh","state":null,"postalCode":"WN7 4PE"}},{"externalCode":"8068","uri":"\/cinemas\/llandudno","name":"Llandudno","filename":"\/static\/dam\/jcr:8f7bd264-70aa-45ee-996f-a1aad6c46358","latitude":53.282288,"longitude":-3.80842,"address":{"address1":"Junction Way Leisure Park","address2":null,"address3":null,"address4":null,"city":"Llandudno Junction","state":null,"postalCode":"LL31 9XX"}},{"externalCode":"8020","uri":"\/cinemas\/london-bexleyheath","name":"London - Bexleyheath","filename":"\/static\/dam\/jcr:98f82ff3-2a4a-4059-9a31-198b9b26fd06","latitude":51.456276,"longitude":0.150038,"address":{"address1":"28-70 Broadway","address2":"Bexleyheath","address3":null,"address4":null,"city":"London","state":null,"postalCode":"DA6 7LL"}},{"externalCode":"8045","uri":"\/cinemas\/london-enfield","name":"London - Enfield","filename":"\/static\/dam\/jcr:a53235b1-be58-4a43-9b7a-67431acb668a","latitude":51.65255,"longitude":-0.061396,"address":{"address1":"Southbury Leisure Centre","address2":"208 Southbury Road","address3":"Enfield","address4":null,"city":"London","state":null,"postalCode":"EN1 1YQ"}},{"externalCode":"8047","uri":"\/cinemas\/london-feltham","name":"London - Feltham","filename":"\/static\/dam\/jcr:98f82ff3-2a4a-4059-9a31-198b9b26fd06","latitude":51.443893,"longitude":-0.404602,"address":{"address1":"Leisure West","address2":"Air Park Way","address3":"Feltham","address4":null,"city":"London","state":null,"postalCode":"TW13 7LX"}},{"externalCode":"8048","uri":"\/cinemas\/london-fulham-road","name":"London - Fulham Road","filename":"\/static\/dam\/jcr:d4a3f2f5-67df-4fdb-b89c-34151dcc85a0","latitude":51.487152,"longitude":-0.179403,"address":{"address1":"142 Fulham Road","address2":null,"address3":null,"address4":null,"city":"London","state":null,"postalCode":"SW10 9QR"}},{"externalCode":"8062","uri":"\/cinemas\/london-ilford","name":"London - Ilford","filename":"\/static\/dam\/jcr:18141cd1-8dfe-4e73-b3d7-3ff59d40532b","latitude":51.557636,"longitude":0.074141,"address":{"address1":"I-Scene","address2":"Clements Road","address3":"Ilford","address4":null,"city":"London","state":null,"postalCode":"IG1 1BP"}},{"externalCode":"8110","uri":"\/cinemas\/london-leicester-square","name":"London - Leicester Square","filename":"\/static\/dam\/jcr:f89ddc09-a113-4060-b33c-e48f99658765","latitude":51.510868,"longitude":-0.1325853,"address":{"address1":"5-6 Leicester Square","address2":null,"address3":null,"address4":null,"city":"London","state":null,"postalCode":"WC2H 7NA"}},{"externalCode":"8118","uri":"\/cinemas\/london-south-ruislip","name":"London - South Ruislip","filename":"\/static\/dam\/jcr:9b8feace-bc08-4db5-bf0d-d75eb467bad2","latitude":51.560516,"longitude":-0.401414,"address":{"address1":"The Old Dairy","address2":"Victoria Road","address3":null,"address4":null,"city":"Ruislip","state":null,"postalCode":"HA4 0EU"}},{"externalCode":"8052","uri":"\/cinemas\/london-the-o2-greenwich","name":"London - The O2 Greenwich","filename":"\/static\/dam\/jcr:b95e410f-1679-4794-8f97-55c2ede741ff","latitude":51.50265,"longitude":0.00309,"address":{"address1":"The O2","address2":"Peninsula Square","address3":null,"address4":null,"city":"London","state":null,"postalCode":"SE10 0DX"}},{"externalCode":"8089","uri":"\/cinemas\/london-wandsworth","name":"London - Wandsworth","filename":"\/static\/dam\/jcr:b24c709a-68e8-4c73-ab5f-5588c240d42a","latitude":51.455402,"longitude":-0.194168,"address":{"address1":"Southside Shopping Centre","address2":"Wandsworth High Street","address3":null,"address4":null,"city":"London","state":null,"postalCode":"SW18 4TF"}},{"externalCode":"8090","uri":"\/cinemas\/london-wembley","name":"London - Wembley","filename":"\/static\/dam\/jcr:a1562087-3bf5-4154-b8d9-e2fb3c4e6b2a","latitude":51.556763,"longitude":-0.282136,"address":{"address1":"London Designer Outlet","address2":"Wembley Park Boulevard","address3":null,"address4":null,"city":"London","state":null,"postalCode":"HA9 0FD"}},{"externalCode":"8092","uri":"\/cinemas\/london-west-india-quay","name":"London - West India Quay","filename":"\/static\/dam\/jcr:8539592d-7be6-44e4-8f3b-ff9fcb5b339b","latitude":51.507645,"longitude":-0.023818,"address":{"address1":"Hertsmere Road","address2":"West India Quay","address3":null,"address4":null,"city":"London","state":null,"postalCode":"E14 4AL"}},{"externalCode":"8094","uri":"\/cinemas\/london-wood-green","name":"London - Wood Green","filename":"\/static\/dam\/jcr:9fd7cc6b-7692-4402-b051-0cc8c63c1243","latitude":51.594543,"longitude":-0.106431,"address":{"address1":"The Mall Wood Green","address2":"High Road","address3":null,"address4":null,"city":"London","state":null,"postalCode":"N22 6LU"}},{"externalCode":"8108","uri":"\/cinemas\/loughborough","name":"Loughborough","filename":"\/static\/dam\/jcr:f848815a-a872-4961-a7fd-2c431e5ea7a2","latitude":52.772587,"longitude":-1.2062081,"address":{"address1":"Baxter Gate","address2":null,"address3":null,"address4":null,"city":"Loughborough","state":null,"postalCode":"LE11 1TH"}},{"externalCode":"8069","uri":"\/cinemas\/luton","name":"Luton","filename":"\/static\/dam\/jcr:8843b8a5-978f-447e-8a9e-1190603e7e87","latitude":51.881855,"longitude":-0.417634,"address":{"address1":"The Galaxy","address2":"Bridge Street","address3":null,"address4":null,"city":"Luton","state":null,"postalCode":"LU1 2NB"}},{"externalCode":"8070","uri":"\/cinemas\/middlesbrough","name":"Middlesbrough","filename":"\/static\/dam\/jcr:4bba919f-c8e0-4d43-b0e8-01f9ce3ff891","latitude":54.57467,"longitude":-1.226274,"address":{"address1":"Middlesbrough Leisure Park","address2":"Marton Road","address3":null,"address4":null,"city":"Middlesbrough","state":null,"postalCode":"TS1 2DY"}},{"externalCode":"8071","uri":"\/cinemas\/milton-keynes","name":"Milton Keynes","filename":"\/static\/dam\/jcr:e0b681f9-099c-49f5-bc20-73b231163181","latitude":52.041435,"longitude":-0.748677,"address":{"address1":"Xscape","address2":"602 Marlborough Gate","address3":null,"address4":null,"city":"Milton Keynes","state":null,"postalCode":"MK9 3XZ"}},{"externalCode":"8117","uri":"\/cinemas\/newcastle-upon-tyne","name":"Newcastle upon Tyne","filename":"\/static\/dam\/jcr:0febedfa-2a2f-401d-b2a4-336bb04c411a","latitude":54.9724,"longitude":-1.61797,"address":{"address1":"The Gate","address2":"Newgate Street","address3":null,"address4":null,"city":"Newcastle upon Tyne","state":null,"postalCode":"NE1 5TG"}},{"externalCode":"8103","uri":"\/cinemas\/newport-friars-walk","name":"Newport - Friars Walk","filename":"\/static\/dam\/jcr:e544c60a-6532-4b15-a698-5d738ea169e1","latitude":51.5859,"longitude":-2.9925406,"address":{"address1":"Friars Walk Shopping Centre\u00A0","address2":"Usk Plaza","address3":null,"address4":null,"city":"Newport","state":null,"postalCode":"NP20 1DS"}},{"externalCode":"8063","uri":"\/cinemas\/newport-isle-of-wight","name":"Newport - Isle of Wight","filename":"\/static\/dam\/jcr:98f82ff3-2a4a-4059-9a31-198b9b26fd06","latitude":50.69895,"longitude":-1.289221,"address":{"address1":"Coppins Bridge","address2":null,"address3":null,"address4":null,"city":"Newport","state":"Isle of Wight","postalCode":"PO30 2TA"}},{"externalCode":"8072","uri":"\/cinemas\/newport-spytty-park","name":"Newport - Spytty Park","filename":"\/static\/dam\/jcr:f00247af-bc0f-4082-af26-0e67c7eb338a","latitude":51.57757,"longitude":-2.943588,"address":{"address1":"Newport Retail Park","address2":"Spytty Road","address3":null,"address4":null,"city":"Newport","state":null,"postalCode":"NP19 4QQ"}},{"externalCode":"8073","uri":"\/cinemas\/northampton","name":"Northampton","filename":"\/static\/dam\/jcr:fe5d38b1-ae61-44b3-a420-356fc1f8d191","latitude":52.236797,"longitude":-0.936617,"address":{"address1":"Sixfields Leisure","address2":"Weedon Road","address3":null,"address4":null,"city":"Northampton","state":null,"postalCode":"NN5 5QJ"}},{"externalCode":"8074","uri":"\/cinemas\/nottingham","name":"Nottingham","filename":"\/static\/dam\/jcr:98f82ff3-2a4a-4059-9a31-198b9b26fd06","latitude":52.95542,"longitude":-1.1498,"address":{"address1":"The Corner House","address2":"29 Forman Street","address3":null,"address4":null,"city":"Nottingham","state":null,"postalCode":"NG1 4AA"}},{"externalCode":"8127","uri":"\/cinemas\/plymouth","name":"Plymouth","filename":"\/static\/dam\/jcr:0febedfa-2a2f-401d-b2a4-336bb04c411a","latitude":50.370632,"longitude":-4.1368365,"address":{"address1":"Unit 17","address2":"11 Bretonside","address3":null,"address4":null,"city":"Plymouth","state":null,"postalCode":"PL4 0FE"}},{"externalCode":"8112","uri":"\/cinemas\/poole","name":"Poole","filename":"\/static\/dam\/jcr:0febedfa-2a2f-401d-b2a4-336bb04c411a","latitude":50.7464,"longitude":-1.95176,"address":{"address1":"Tower Park","address2":null,"address3":null,"address4":null,"city":"Poole","state":null,"postalCode":"BH12 4NY"}},{"externalCode":"8075","uri":"\/cinemas\/rochester","name":"Rochester","filename":"\/static\/dam\/jcr:912699ca-c161-4b66-96da-229cfd5ee87f","latitude":51.38003,"longitude":0.477112,"address":{"address1":"Medway Valley Leisure Park","address2":"Chariot Way","address3":null,"address4":null,"city":"Rochester","state":null,"postalCode":"ME2 2SS"}},{"externalCode":"8076","uri":"\/cinemas\/rugby","name":"Rugby","filename":"\/static\/dam\/jcr:c426a5d4-5e1b-462f-974f-bb25d60e4498","latitude":52.38524,"longitude":-1.259169,"address":{"address1":"Junction One","address2":"Leicester Road","address3":null,"address4":null,"city":"Rugby","state":null,"postalCode":"CV21 1RW"}},{"externalCode":"8077","uri":"\/cinemas\/runcorn","name":"Runcorn","filename":"\/static\/dam\/jcr:de0e3ac2-b04f-41c9-aaf4-fed36c4aa0c4","latitude":53.3262,"longitude":-2.699966,"address":{"address1":"Trident Park","address2":"Halton Lea","address3":null,"address4":null,"city":"Runcorn","state":null,"postalCode":"WA7 2FQ"}},{"externalCode":"8125","uri":"\/cinemas\/rushden-lakes","name":"Rushden Lakes","filename":"\/static\/dam\/jcr:0febedfa-2a2f-401d-b2a4-336bb04c411a","latitude":52.301655,"longitude":-0.6201389,"address":{"address1":"Unit 16","address2":"Northampton Road","address3":"West Terrace","address4":"Rushden Lakes","city":"Rushden","state":null,"postalCode":"NN10 6FA"}},{"externalCode":"8079","uri":"\/cinemas\/sheffield","name":"Sheffield","filename":"\/static\/dam\/jcr:f0acfcbd-644d-4b8e-917a-5ab2a67ecc33","latitude":53.40154,"longitude":-1.414966,"address":{"address1":"Valley Centertainment","address2":"Broughton Lane","address3":null,"address4":null,"city":"Sheffield","state":null,"postalCode":"S9 2EP"}},{"externalCode":"8080","uri":"\/cinemas\/shrewsbury","name":"Shrewsbury","filename":"\/static\/dam\/jcr:bc6356f9-7557-401e-bc7c-91847c10f32b","latitude":52.70355,"longitude":-2.74053,"address":{"address1":"Old Potts Way","address2":null,"address3":null,"address4":null,"city":"Shrewsbury","state":null,"postalCode":"SY3 7ET"}},{"externalCode":"8081","uri":"\/cinemas\/solihull","name":"Solihull","filename":"\/static\/dam\/jcr:98f82ff3-2a4a-4059-9a31-198b9b26fd06","latitude":52.412453,"longitude":-1.778998,"address":{"address1":"47 Upper Jubilee Walk","address2":"Touchwood","address3":null,"address4":null,"city":"Solihull","state":null,"postalCode":"B91 3QW"}},{"externalCode":"8123","uri":"\/cinemas\/speke","name":"Speke","filename":"\/static\/dam\/jcr:899e986b-82a0-4586-bf54-b8eee771b3ee","latitude":53.349564,"longitude":-2.8828237,"address":{"address1":"New Mersey Shopping Park","address2":"Speke Road","address3":null,"address4":null,"city":"Speke, Merseyside","state":null,"postalCode":"L24 8QB"}},{"externalCode":"8084","uri":"\/cinemas\/stevenage","name":"Stevenage","filename":"\/static\/dam\/jcr:117ef249-5f84-458b-b208-0a2e8bcf536a","latitude":51.899914,"longitude":-0.20823,"address":{"address1":"Stevenage Leisure Park","address2":"Kings Way","address3":null,"address4":null,"city":"Stevenage","state":null,"postalCode":"SG1 2UA"}},{"externalCode":"8085","uri":"\/cinemas\/st-helens","name":"St Helens","filename":"\/static\/dam\/jcr:58a33e2a-6413-400c-b7e0-e67dc333ec2c","latitude":53.451378,"longitude":-2.739894,"address":{"address1":"Chalon Way West","address2":null,"address3":null,"address4":null,"city":"St Helens","state":null,"postalCode":"WA10 1BF"}},{"externalCode":"8098","uri":"\/cinemas\/st-neots","name":"St Neots","filename":"\/static\/dam\/jcr:951331ee-f340-444b-94b9-b5e8b8cd4821","latitude":52.22903,"longitude":-0.265743,"address":{"address1":"The Rowley Arts Centre","address2":"Huntingdon Street","address3":null,"address4":null,"city":"St Neots","state":null,"postalCode":"PE19 1BH"}},{"externalCode":"8106","uri":"\/cinemas\/stoke-on-trent","name":"Stoke-on-Trent","filename":"\/static\/dam\/jcr:0febedfa-2a2f-401d-b2a4-336bb04c411a","latitude":53.027554,"longitude":-2.1759024,"address":{"address1":"Quadrant Road","address2":"City Centre","address3":null,"address4":null,"city":"Stoke-on-Trent","state":null,"postalCode":"ST1 1PS"}},{"externalCode":"8099","uri":"\/cinemas\/swindon-regent-circus","name":"Swindon - Regent Circus","filename":"\/static\/dam\/jcr:0febedfa-2a2f-401d-b2a4-336bb04c411a","latitude":51.55814,"longitude":-1.7803051,"address":{"address1":"Victoria Road","address2":null,"address3":null,"address4":null,"city":"Swindon","state":null,"postalCode":"SN1 1FA"}},{"externalCode":"8087","uri":"\/cinemas\/swindon-shaw-ridge","name":"Swindon - Shaw Ridge","filename":"\/static\/dam\/jcr:f9af8058-a580-420f-ae9f-457147a28e90","latitude":51.560783,"longitude":-1.83149,"address":{"address1":"Shaw Ridge Leisure Park","address2":"Whitehill Way","address3":null,"address4":null,"city":"Swindon","state":null,"postalCode":"SN5 7DN"}},{"externalCode":"8097","uri":"\/cinemas\/telford","name":"Telford","filename":"\/static\/dam\/jcr:a2b8b1e3-e7ba-420c-b82a-74f538b57075","latitude":52.673954,"longitude":-2.446977,"address":{"address1":"Southwater Square","address2":null,"address3":null,"address4":null,"city":"Telford","state":null,"postalCode":"TF3 4HS"}},{"externalCode":"8088","uri":"\/cinemas\/wakefield","name":"Wakefield","filename":"\/static\/dam\/jcr:05ebf6c6-8e73-4449-81ff-158c988fb585","latitude":53.67716,"longitude":-1.505222,"address":{"address1":"Westgate Leisure Park","address2":"Colinsway","address3":null,"address4":null,"city":"Wakefield","state":null,"postalCode":"WF2 9SH"}},{"externalCode":"8129","uri":"\/cinemas\/warrington","name":"Warrington","filename":"\/static\/dam\/jcr:0febedfa-2a2f-401d-b2a4-336bb04c411a","latitude":53.38796,"longitude":-2.59085,"address":{"address1":"Bridge Street","address2":"Quarter Times Square","address3":"Academy Way","address4":null,"city":"Warrington","state":null,"postalCode":"WA1 2HN"}},{"externalCode":"8124","uri":"\/cinemas\/watford","name":"Watford","filename":"\/static\/dam\/jcr:11080f9b-e2ae-447a-bcd4-bd4b0fbe3170","latitude":51.65463,"longitude":-0.39272,"address":{"address1":"intu Charter Place Shopping Centre","address2":"Queens Road","address3":null,"address4":null,"city":"Watford","state":null,"postalCode":"WD17 2UB"}},{"externalCode":"8121","uri":"\/cinemas\/weston-super-mare","name":"Weston-super-Mare","filename":"\/static\/dam\/jcr:0febedfa-2a2f-401d-b2a4-336bb04c411a","latitude":51.3452,"longitude":-2.978286,"address":{"address1":"7 Central Walk","address2":"Dolphin Square","address3":null,"address4":null,"city":"Weston-super-Mare","state":null,"postalCode":"BS23 1FF"}},{"externalCode":"8091","uri":"\/cinemas\/weymouth","name":"Weymouth","filename":"\/static\/dam\/jcr:8843b8a5-978f-447e-8a9e-1190603e7e87","latitude":50.60973,"longitude":-2.456083,"address":{"address1":"New Bond Street","address2":null,"address3":null,"address4":null,"city":"Weymouth","state":null,"postalCode":"DT4 8LY"}},{"externalCode":"8104","uri":"\/cinemas\/whiteley","name":"Whiteley","filename":"\/static\/dam\/jcr:1e53a6da-eefa-47a6-a601-06f43bf3f9fa","latitude":50.886055,"longitude":-1.248155,"address":{"address1":"Whiteley Shopping Centre","address2":"Whiteley Way","address3":null,"address4":null,"city":"Fareham","state":null,"postalCode":"PO15 7PD"}},{"externalCode":"8093","uri":"\/cinemas\/witney","name":"Witney","filename":"\/static\/dam\/jcr:a9eb8afc-56e8-4be9-a922-f2dc49712306","latitude":51.788033,"longitude":-1.48606,"address":{"address1":"Marriots Walk","address2":null,"address3":null,"address4":null,"city":"Witney","state":null,"postalCode":"OX28 6GW"}},{"externalCode":"8095","uri":"\/cinemas\/wolverhampton","name":"Wolverhampton","filename":"\/static\/dam\/jcr:8843b8a5-978f-447e-8a9e-1190603e7e87","latitude":52.596725,"longitude":-2.0932,"address":{"address1":"Bentley Bridge Park","address2":"Wednesfield Way","address3":null,"address4":null,"city":"Wolverhampton","state":null,"postalCode":"WV11 1TZ"}},{"externalCode":"8107","uri":"\/cinemas\/yate","name":"Yate","filename":"\/static\/dam\/jcr:4b04c767-08a7-45ca-a88d-7c53c478dba7","latitude":51.53914,"longitude":-2.409117,"address":{"address1":"Riverside","address2":"Link Road","address3":null,"address4":null,"city":"Yate","state":null,"postalCode":"BS37 4FT"}},{"externalCode":"8096","uri":"\/cinemas\/yeovil","name":"Yeovil","filename":"\/static\/dam\/jcr:adadf1b0-6120-49a5-9f7f-8dd574b0841b","latitude":50.94037,"longitude":-2.625528,"address":{"address1":"Yeo Leisure Park","address2":"Old Station Way","address3":null,"address4":null,"city":"Yeovil","state":null,"postalCode":"BA20 1NP"}},{"externalCode":"8128","uri":"\/cinemas\/york","name":"York","filename":"\/static\/dam\/jcr:0febedfa-2a2f-401d-b2a4-336bb04c411a","latitude":53.98474,"longitude":-1.04983,"address":{"address1":"York Community Stadium","address2":"Kathryn Avenue, Huntingdon","address3":null,"address4":null,"city":"York","state":null,"postalCode":"YO32 9AF"}}],
  pluginLocale = "en-gb", // e.g. en-gb, pl-pl, he-il
  selectedLocale = "en_GB", // e.g. en_GB, pl_PL, he_IL
  attributesDubSub = {
    'subbed': "Subtitled",
    'dubbed': "Dubbed",
    'sub': "Subtitled",
    'dub': "Dubbed"
  }`;
