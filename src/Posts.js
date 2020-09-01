import React, {Component} from 'react';
import {FlatList, TextInput, Modal, StyleSheet} from 'react-native';
import {Container, Card, CardItem, Body, Text, Header} from 'native-base';

const URL = 'https://hn.algolia.com/api/v1/search_by_date?tags=story';

export default class Posts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      serverData: [],
      isLoading: false,
      filtered: false,
      search: null,
      error: false,
      single: false,
      singleData: {},
      page: 0,
      errorText: '',
    };
    this.mounted = true;
    this.getPost = this.getPost.bind(this);
  }
  componentDidMount() {
    let that = this;
    this.getPost();
    this.setInterval = setInterval(function () {
      that.getPost();
    }, 10000);
  }

  componentWillUnmount() {
    this.mounted = false;
    clearInterval(this.setInterval);
  }

  getPost = () => {
    if (this.mounted) {
      fetch(URL + '&page=' + this.state.page)
        .then((response) => response.json())
        .then((res) => {
          this.setState({
            serverData: this.state.serverData.concat(res.hits),
            page: this.state.page + 1,
          });
        })
        .catch((error) => {
          this.setState({
            isLoading: false,
            error: true,
            errorText: error.toString(),
          });
        })
        .finally(() => {
          this.setState({
            isLoading: false,
          });
        });
    }
  };

  onpageIncrease() {
    this.getPost(this.state.page + 1);
  }

  onchangeText(search) {
    if (search !== '') {
      this.setState({
        search,
        filtered: true,
      });
    } else {
      this.setState({
        search,
        filtered: false,
      });
    }
  }
  renderItem(item) {
    return (
      <Card key={item.objectID}>
        <CardItem
          button
          onPress={() => this.setState({single: true, singleData: item})}>
          <Body>
            <Text style={styles.title}>Title: {item.title}</Text>
            <Text style={styles.url}>URL: {item.url}</Text>
          </Body>
        </CardItem>
      </Card>
    );
  }

  renderList() {
    const {serverData, filtered, search} = this.state;
    let renderedList = null;

    if (serverData.length > 0) {
      let finalData = [];
      if (filtered) {
        let filter = search;
        finalData = serverData.filter((item) => {
          let title = item.title;
          let author = item.author;
          if (item != null && title.indexOf(filter) !== -1) {
            return item;
          }
          if (item != null && author.indexOf(filter) !== -1) {
            return item;
          }
        });
      } else {
        finalData = serverData;
      }
      if (finalData.length > 0) {
        return (
          <FlatList
            ListHeaderComponent={<Text> {this.state.serverData.length}</Text>}
            onEndReachedThreshold="0"
            onEndReached={() => this.onpageIncrease()}
            data={finalData}
            renderItem={(item) => this.renderItem(item)}
            keyExtractor={(item, index) => index.toString()}
          />
        );
      } else if (search !== '' && filtered === true) {
        return <Text> No matching search</Text>;
      }
    }
  }

  renderOne() {
    const {singleData} = this.state;
    return (
      <Modal
        visible={true}
        onRequestClose={() => {
          this.setState({
            single: false,
            singleData: {},
          });
        }}>
        <Text> {JSON.stringify(singleData)}</Text>
      </Modal>
    );
  }
  render() {
    return (
      <Container>
        <Header>
          <Body>
            <TextInput
              placeholder="Search"
              onChangeText={(text) => this.onchangeText(text)}
              value={this.state.search}
            />
          </Body>
        </Header>
        {this.state.single ? this.renderOne() : this.renderList()}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
  },
  url: {
    fontSize: 14,
    color: '#000',
  },
});
